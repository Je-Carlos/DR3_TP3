import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { database, storage } from "../../firebase/firebase";
import { ref, set, push, update, remove, onValue } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const Home = () => {
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [images, setImages] = useState([]);
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus.status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de permissão para acessar a galeria."
        );
      }
    })();

    const itemsRef = ref(database, "items");
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          images: data[key].images || [], // Garantir que images esteja definido
        }));
        setItems(itemList);
      } else {
        setItems([]);
      }
    });
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      console.error("Erro ao selecionar a imagem:", error);
    }
  };

  const uploadImages = async (itemId) => {
    const imageUrls = [];
    for (const image of images) {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      const imageRef = storageRef(storage, `items/${itemId}/${image.fileName}`);
      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);
      imageUrls.push(url);
    }
    return imageUrls;
  };

  const handleSubmit = async () => {
    if (editingItemId) {
      const itemRef = ref(database, `items/${editingItemId}`);
      const imageUrls = await uploadImages(editingItemId);
      await update(itemRef, {
        name: itemName,
        description: itemDescription,
        images: imageUrls,
      });
      setEditingItemId(null);
    } else {
      const newItemRef = push(ref(database, "items"));
      const itemId = newItemRef.key;
      const imageUrls = await uploadImages(itemId);
      await set(newItemRef, {
        name: itemName,
        description: itemDescription,
        images: imageUrls,
      });
    }
    setItemName("");
    setItemDescription("");
    setImages([]);
  };

  const handleEdit = (item) => {
    setItemName(item.name);
    setItemDescription(item.description);
    setImages(
      item.images.map((url, index) => ({ uri: url, fileName: `image${index}` }))
    );
    setEditingItemId(item.id);
  };

  const handleDelete = (itemId) => {
    Alert.alert(
      "Confirmação",
      "Você tem certeza que deseja deletar este item?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Deletar",
          onPress: async () => {
            const itemRef = ref(database, `items/${itemId}`);
            await remove(itemRef);
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{item.name}</Text>
      <Text>{item.description}</Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}
      >
        {item.images.map((url, index) => (
          <Image
            key={index}
            source={{ uri: url }}
            style={{ width: 100, height: 100, margin: 5 }}
          />
        ))}
      </View>
      <Button title="Editar" onPress={() => handleEdit(item)} />
      <Button title="Deletar" onPress={() => handleDelete(item.id)} />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text>Nome do Item</Text>
      <TextInput
        value={itemName}
        onChangeText={setItemName}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Text>Descrição do Item</Text>
      <TextInput
        value={itemDescription}
        onChangeText={setItemDescription}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Selecionar Imagens" onPress={pickImage} />
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 10 }}
      >
        {images.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image.uri }}
            style={{ width: 100, height: 100, margin: 5 }}
          />
        ))}
      </View>
      <Button
        title={editingItemId ? "Salvar Alterações" : "Cadastrar Item"}
        onPress={handleSubmit}
      />
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 20 }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
          <Ionicons name="person" size={30} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Configuracao")}>
          <Ionicons name="settings" size={30} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Home;
