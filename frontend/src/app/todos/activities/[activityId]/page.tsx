"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  CreateTodoCategoryDocument,
  CreateTodoCategoryMutation,
  CompleteTodoActivityDocument,
  CompleteTodoActivityMutation,
  CreateTodoItemDocument,
  CreateTodoItemMutation,
  DeleteTodoItemDocument,
  DeleteTodoItemMutation,
  TodoCategoriesDocument,
  TodoCategoriesQuery,
  TodoItemsDocument,
  TodoItemsQuery,
  UpdateTodoCategoryDocument,
  UpdateTodoCategoryMutation,
  UpdateTodoItemDocument,
  UpdateTodoItemMutation,
} from "@/graphql/generated";

type Category = NonNullable<TodoCategoriesQuery["categories"][number]>;
type TodoItem = NonNullable<TodoItemsQuery["items"][number]>;

export default function ActivityTodosPage() {
  const params = useParams<{ activityId: string }>();
  const router = useRouter();
  const { requestAuthenticatedGraphQL } = useAuth();
  const categoryId = params.activityId;
  const isNewCategory = categoryId === "new";
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<TodoItem[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryName, setEditingCategoryName] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [pendingItems, setPendingItems] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const errorsFrom = (errors: Array<string | null> | undefined) =>
    errors?.filter((message): message is string => Boolean(message)).join(", ");

  const loadCategory = useCallback(async () => {
    if (isNewCategory) {
      setLoading(false);
      setEditingCategoryName(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [categoriesData, itemsData] = await Promise.all([
        requestAuthenticatedGraphQL<TodoCategoriesQuery>(
          TodoCategoriesDocument,
        ),
        requestAuthenticatedGraphQL<TodoItemsQuery>(TodoItemsDocument, {
          isResolved: null,
        }),
      ]);
      const selectedCategory = categoriesData.categories.find(
        (item): item is Category => item?.id === categoryId,
      );
      if (!selectedCategory) {
        throw new Error("Atividade não encontrada.");
      }
      setCategory(selectedCategory);
      setCategoryName(selectedCategory.name);
      setItems(
        itemsData.items.filter(
          (item): item is TodoItem =>
            item?.category?.id === selectedCategory.id,
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao carregar a atividade.");
    } finally {
      setLoading(false);
    }
  }, [categoryId, isNewCategory, requestAuthenticatedGraphQL]);

  useEffect(() => {
    void loadCategory();
  }, [loadCategory]);

  const saveCategory = async () => {
    if (!categoryName.trim() || (!category && !isNewCategory)) return;
    setSaving(true);
    setError(null);
    try {
      if (isNewCategory) {
        const categoryData =
          await requestAuthenticatedGraphQL<CreateTodoCategoryMutation>(
            CreateTodoCategoryDocument,
            { name: categoryName.trim() },
          );
        const categoryErrors = errorsFrom(categoryData.createCategory?.errors);
        const createdCategory = categoryData.createCategory?.category;
        if (categoryErrors || !createdCategory) {
          throw new Error(categoryErrors || "Falha ao criar a atividade.");
        }

        for (const itemName of pendingItems) {
          const itemData =
            await requestAuthenticatedGraphQL<CreateTodoItemMutation>(
              CreateTodoItemDocument,
              {
                name: itemName,
                categoryId: createdCategory.id,
                isResolved: false,
              },
            );
          const itemErrors = errorsFrom(itemData.createItem?.errors);
          if (itemErrors || !itemData.createItem?.item) {
            throw new Error(itemErrors || "Falha ao criar um dos itens.");
          }
        }

        router.push(`/todos/categories/${createdCategory.id}`);
        return;
      }

      const data =
        await requestAuthenticatedGraphQL<UpdateTodoCategoryMutation>(
          UpdateTodoCategoryDocument,
          { id: category!.id, name: categoryName.trim() },
        );
      const errors = errorsFrom(data.updateCategory?.errors);
      if (errors) throw new Error(errors);
      setEditingCategoryName(false);
      await loadCategory();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao salvar a atividade.");
    } finally {
      setSaving(false);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;
    if (isNewCategory) {
      setPendingItems((currentItems) => [...currentItems, newItemName.trim()]);
      setNewItemName("");
      return;
    }
    if (!category) return;
    setSaving(true);
    setError(null);
    try {
      const data = await requestAuthenticatedGraphQL<CreateTodoItemMutation>(
        CreateTodoItemDocument,
        {
          name: newItemName.trim(),
          categoryId: category.id,
          isResolved: false,
        },
      );
      const errors = errorsFrom(data.createItem?.errors);
      if (errors) throw new Error(errors);
      setNewItemName("");
      await loadCategory();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao adicionar o item.");
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = async (item: TodoItem) => {
    const nextResolved = !item.isResolved;
    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? { ...currentItem, isResolved: nextResolved }
          : currentItem,
      ),
    );
    setSaving(true);
    setError(null);
    try {
      const data = await requestAuthenticatedGraphQL<UpdateTodoItemMutation>(
        UpdateTodoItemDocument,
        {
          id: item.id,
          name: item.name,
          categoryId: categoryId,
          isResolved: nextResolved,
        },
      );
      const errors = errorsFrom(data.updateItem?.errors);
      if (errors) throw new Error(errors);
    } catch (cause) {
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, isResolved: item.isResolved }
            : currentItem,
        ),
      );
      setError(cause instanceof Error ? cause.message : "Falha ao atualizar o item.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActivityResolved = async () => {
    if (!category) return;
    setSaving(true);
    setError(null);
    try {
      const data =
        await requestAuthenticatedGraphQL<CompleteTodoActivityMutation>(
          CompleteTodoActivityDocument,
          { id: category.id, isResolved: !category.isResolved },
        );
      const errors = errorsFrom(data.completeActivity?.errors);
      if (errors) throw new Error(errors);
      await loadCategory();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Falha ao atualizar o status da atividade.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async (item: TodoItem) => {
    if (!editingItemName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const data = await requestAuthenticatedGraphQL<UpdateTodoItemMutation>(
        UpdateTodoItemDocument,
        {
          id: item.id,
          name: editingItemName.trim(),
          categoryId,
          isResolved: item.isResolved,
        },
      );
      const errors = errorsFrom(data.updateItem?.errors);
      if (errors) throw new Error(errors);
      setEditingItemId(null);
      await loadCategory();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao editar o item.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const data = await requestAuthenticatedGraphQL<DeleteTodoItemMutation>(
        DeleteTodoItemDocument,
        { id },
      );
      const errors = errorsFrom(data.deleteItem?.errors);
      if (!data.deleteItem?.success || errors) {
        throw new Error(errors || "Falha ao excluir o item.");
      }
      await loadCategory();
      setDeleteItemId(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao excluir o item.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button component={NextLink} href="/todos" startIcon={<ArrowBackIcon />}>
          Voltar para TODOs
        </Button>
        <Button
          component={NextLink}
          href="/"
          variant="outlined"
          startIcon={<DashboardIcon />}
        >
          Dashboard
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {category || isNewCategory ? (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {isNewCategory ? "Nova atividade" : "Atividade"}
              </Typography>
              {isNewCategory || editingCategoryName ? (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 1 }}
                >
                  <TextField
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !isNewCategory) {
                        void saveCategory();
                      }
                      if (event.key === "Escape" && !isNewCategory) {
                        setCategoryName(category!.name);
                        setEditingCategoryName(false);
                      }
                    }}
                    fullWidth
                    autoFocus
                    label="Nome da atividade"
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => void saveCategory()}
                      disabled={saving}
                    >
                      Salvar
                    </Button>
                    {!isNewCategory && (
                      <Button
                        onClick={() => {
                          setCategoryName(category!.name);
                          setEditingCategoryName(false);
                        }}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <Typography variant="h5" fontWeight={700}>
                    {category!.name}
                  </Typography>
                  <IconButton
                    aria-label="Editar nome da atividade"
                    onClick={() => {
                      setCategoryName(category!.name);
                      setEditingCategoryName(true);
                    }}
                    disabled={saving}
                  >
                    <EditIcon />
                  </IconButton>
                  <Button
                    size="small"
                    color={category!.isResolved ? "success" : "primary"}
                    startIcon={
                      category!.isResolved ? (
                        <CheckCircleIcon />
                      ) : (
                        <RadioButtonUncheckedIcon />
                      )
                    }
                    onClick={() => void toggleActivityResolved()}
                    disabled={saving || !items.length}
                  >
                    {category!.isResolved ? "Concluída" : "Concluir atividade"}
                  </Button>
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography color="text.secondary">
                {items.length + pendingItems.length} item(ns) nesta atividade
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1}>
                <TextField
                  value={newItemName}
                  onChange={(event) => setNewItemName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void addItem();
                  }}
                  label="Novo item"
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => void addItem()}
                  disabled={saving}
                >
                  Adicionar
                </Button>
              </Stack>
              <List sx={{ mt: 2 }}>
                {pendingItems.map((itemName, index) => (
                  <ListItem
                    key={`pending-${index}`}
                    divider
                    secondaryAction={
                      <IconButton
                        aria-label="Excluir item"
                        onClick={() =>
                          setPendingItems((currentItems) =>
                            currentItems.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        disabled={saving}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={itemName} />
                  </ListItem>
                ))}
                {items.map((item) => (
                  <ListItem
                    key={item.id}
                    divider
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setEditingItemId(item.id);
                            setEditingItemName(item.name);
                          }}
                          disabled={item.isResolved}
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleteItemId(item.id)}
                          disabled={item.isResolved}
                        >
                          Excluir
                        </Button>
                      </Stack>
                    }
                  >
                    <Checkbox
                      checked={item.isResolved}
                      onChange={() => void toggleItem(item)}
                      disabled={saving}
                    />
                    {editingItemId === item.id ? (
                      <TextField
                        value={editingItemName}
                        onChange={(event) => setEditingItemName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void saveItem(item);
                        }}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <ListItemText
                        primary={item.name}
                        sx={{
                          textDecoration: item.isResolved
                            ? "line-through"
                            : "none",
                        }}
                      />
                    )}
                  </ListItem>
                ))}
                {!items.length && !pendingItems.length && (
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    Nenhum TODO nesta atividade ainda.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Stack>
      ) : (
        <Alert severity="error">Atividade não encontrada.</Alert>
      )}

      <ConfirmDialog
        open={deleteItemId !== null}
        title="Excluir TODO?"
        message="Tem certeza de que deseja excluir este TODO?"
        loading={saving}
        onClose={() => setDeleteItemId(null)}
        onConfirm={() => {
          if (deleteItemId) {
            void deleteItem(deleteItemId);
          }
        }}
      />
    </Container>
  );
}
