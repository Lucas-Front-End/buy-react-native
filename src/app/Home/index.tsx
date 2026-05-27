import {
  Image,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  Alert,
} from "react-native";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Filter } from "@/components/Filter";
import { Item } from "@/components/Item";

import { styles } from "./styles";
import { FilterStatus } from "@/types/FilterStatus";
import { useEffect, useState } from "react";
import { itemsStorage, ItemsStorage } from "@/storage/itemsStorage";

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE];

export function Home() {
  const [filter, setFilter] = useState(FilterStatus.PENDING);
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ItemsStorage[]>([]);

  async function handleAddItem(description: string) {
    if (description.trim() === "") {
      return Alert.alert(
        "Descrição vazia",
        "Por favor, insira uma descrição para o item.",
      );
    }

    const newItem = {
      id: Math.random().toString(36).substring(2), // Gerar um ID aleatório
      description: description.trim(),
      status: FilterStatus.PENDING,
    };

    await itemsStorage.add(newItem);
    await ItemsByStatus();

    Alert.alert("Sucesso", `${description} adicionado à lista!`);
    setFilter(FilterStatus.PENDING);
    setDescription("");
  }

  async function handleRemoveItem(id: string) {
    try {
      await itemsStorage.remove(id);
      await ItemsByStatus();
    } catch (error) {
      console.log("REMOVE_ITEM: " + error);
      Alert.alert("Erro", "Não foi possível remover o item.");
    }
  }

  async function handleClear() {
    try {
      await itemsStorage.clear();
      setItems([]);

      Alert.alert("Sucesso", "Lista limpa com sucesso.");
    } catch (error) {
      console.log("CLEAR_ITEMS: " + error);
      Alert.alert("Erro", "Não foi possível limpar os itens.");
    }
  }

  async function ItemsByStatus() {
    try {
      const response = await itemsStorage.getByStatus(filter);
      setItems(response);
    } catch (error) {
      console.log("GET_ITEMS: " + error);
      Alert.alert("Erro", "Não foi possível filtrar os itens.");
    }
  }

  async function handleToggleItemStatus(id: string) {
    try {
      await itemsStorage.toggleStatus(id);
      await ItemsByStatus();
    } catch (error) {
      console.log("TOGGLE_ITEM_STATUS: " + error);
      Alert.alert("Erro", "Não foi possível alterar o status do item.");
    }
  }

  useEffect(() => {
    ItemsByStatus();
  }, [filter]);

  return (
    <View style={styles.container}>
      <Image source={require("@/assets/logo.png")} style={styles.logo} />

      <View style={styles.form}>
        <Input
          placeholder="O que você precisa comprar?"
          placeholderTextColor="#74798b"
          autoCapitalize="none"
          value={description}
          onChangeText={(value) => setDescription(value)}
        />

        <Button
          title="Adicionar"
          activeOpacity={0.7}
          onPress={() => handleAddItem(description)}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          {FILTER_STATUS.map((status) => (
            <Filter
              key={status}
              status={status}
              isActive={status === filter}
              onPress={() => setFilter(status)}
            />
          ))}
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => handleClear()}
          >
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Item
              data={item}
              onStatusChange={() => handleToggleItemStatus(item.id)}
              onRemove={() => handleRemoveItem(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <Text style={styles.empty}>Não há itens para exibir</Text>
          )}
        />
      </View>
    </View>
  );
}
