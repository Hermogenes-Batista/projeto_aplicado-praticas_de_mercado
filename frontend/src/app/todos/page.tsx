"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import ThemeSelector from "@/components/ThemeSelector";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  CreateTodoCategoryDocument,
  CreateTodoCategoryMutation,
  CompleteTodoActivityDocument,
  CompleteTodoActivityMutation,
  CreateTodoItemDocument,
  CreateTodoItemMutation,
  DeleteTodoCategoryDocument,
  DeleteTodoCategoryMutation,
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
type DialogMode = "create" | "edit";
type SortDirection = "none" | "asc" | "desc";

interface ItemForm {
  id?: string;
  name: string;
  categoryId: string;
  isResolved: boolean;
}

type DeleteTarget =
  | { type: "item"; id: string; name: string }
  | { type: "category"; id: string; name: string }
  | null;

export default function TodosPage() {
  const { requestAuthenticatedGraphQL } = useAuth();
  const [items, setItems] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>({
    name: "",
    categoryId: "",
    isResolved: false,
  });
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogMode, setItemDialogMode] = useState<DialogMode>("create");
  const [categoryDialogMode, setCategoryDialogMode] =
    useState<DialogMode>("create");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [createdAtSort, setCreatedAtSort] =
    useState<SortDirection>("asc");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[] | null>(
    null,
  );
  const [categoryFilterAnchor, setCategoryFilterAnchor] =
    useState<null | HTMLElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, activitiesData] = await Promise.all([
        requestAuthenticatedGraphQL<TodoItemsQuery>(TodoItemsDocument, {
          isResolved: null,
        }),
        requestAuthenticatedGraphQL<TodoCategoriesQuery>(
          TodoCategoriesDocument,
        ),
      ]);
      setItems(
        itemsData.items.filter((item): item is TodoItem => item !== null),
      );
      setCategories(
        activitiesData.categories.filter(
          (activity): activity is Category => activity !== null,
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao carregar os TODOs.");
    } finally {
      setLoading(false);
    }
  }, [requestAuthenticatedGraphQL]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const mutationErrors = (errors: Array<string | null> | undefined) =>
    errors?.filter((message): message is string => Boolean(message)).join(", ");

  const saveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.categoryId) {
      setError("Um item precisa ter uma atividade.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (itemDialogMode === "create") {
        const data = await requestAuthenticatedGraphQL<CreateTodoItemMutation>(
          CreateTodoItemDocument,
          {
            name: itemForm.name.trim(),
            categoryId: itemForm.categoryId,
            isResolved: itemForm.isResolved,
          },
        );
        const errors = mutationErrors(data.createItem?.errors);
        if (errors) throw new Error(errors);
      } else if (itemForm.id) {
        const data = await requestAuthenticatedGraphQL<UpdateTodoItemMutation>(
          UpdateTodoItemDocument,
          {
            id: itemForm.id,
            name: itemForm.name.trim(),
            categoryId: itemForm.categoryId,
            isResolved: itemForm.isResolved,
          },
        );
        const errors = mutationErrors(data.updateItem?.errors);
        if (errors) throw new Error(errors);
      }
      setItemDialogOpen(false);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao salvar o item.");
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (categoryDialogMode === "create") {
        const data =
          await requestAuthenticatedGraphQL<CreateTodoCategoryMutation>(
            CreateTodoCategoryDocument,
            { name: categoryName.trim() },
          );
        const errors = mutationErrors(data.createCategory?.errors);
        if (errors) throw new Error(errors);
      } else if (categoryId) {
        const data =
          await requestAuthenticatedGraphQL<UpdateTodoCategoryMutation>(
            UpdateTodoCategoryDocument,
            { id: categoryId, name: categoryName.trim() },
          );
        const errors = mutationErrors(data.updateCategory?.errors);
        if (errors) throw new Error(errors);
      }
      setCategoryDialogOpen(false);
      await loadData();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao salvar a atividade.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    const data = await requestAuthenticatedGraphQL<DeleteTodoItemMutation>(
      DeleteTodoItemDocument,
      { id },
    );
    const errors = mutationErrors(data.deleteItem?.errors);
    if (!data.deleteItem?.success || errors) {
      setError(errors || "Falha ao excluir o item.");
      return;
    }
    await loadData();
    setDeleteTarget(null);
  };

  const deleteCategory = async (id: string) => {
    const data =
      await requestAuthenticatedGraphQL<DeleteTodoCategoryMutation>(
        DeleteTodoCategoryDocument,
        { id },
      );
    const errors = mutationErrors(data.deleteCategory?.errors);
    if (!data.deleteCategory?.success || errors) {
      setError(errors || "Falha ao excluir a atividade.");
      return;
    }
    await loadData();
    setDeleteTarget(null);
  };

  const toggleItemResolved = async (item: TodoItem) => {
    if (!item.category?.id) {
      setError("Um item precisa ter uma atividade.");
      return;
    }

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
          categoryId: item.category.id,
          isResolved: nextResolved,
        },
      );
      const errors = mutationErrors(data.updateItem?.errors);
      if (errors) {
        throw new Error(errors);
      }
    } catch (cause) {
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, isResolved: item.isResolved }
            : currentItem,
        ),
      );
      setError(
        cause instanceof Error
          ? cause.message
          : "Falha ao atualizar o status do item.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActivityResolved = async (activity: Category) => {
    const nextResolved = !activity.isResolved;
    setSaving(true);
    setError(null);
    try {
      const data =
        await requestAuthenticatedGraphQL<CompleteTodoActivityMutation>(
          CompleteTodoActivityDocument,
          { id: activity.id, isResolved: nextResolved },
        );
      const errors = mutationErrors(data.completeActivity?.errors);
      if (errors) throw new Error(errors);
      await loadData();
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

  const openNewItem = (categoryId = categories[0]?.id || "") => {
    setItemForm({ name: "", categoryId, isResolved: false });
    setItemDialogMode("create");
    setItemDialogOpen(true);
  };

  const openEditItem = (item: TodoItem) => {
    if (item.isResolved) {
      setError("Itens resolvidos não podem ser editados.");
      return;
    }
    setItemForm({
      id: item.id,
      name: item.name,
      categoryId: item.category?.id || "",
      isResolved: item.isResolved,
    });
    setItemDialogMode("edit");
    setItemDialogOpen(true);
  };

  const openCategory = (category?: Category) => {
    setCategoryId(category?.id);
    setCategoryName(category?.name || "");
    setCategoryDialogMode(category ? "edit" : "create");
    setCategoryDialogOpen(true);
  };

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase("pt-BR");
  const compareBySortOption = (
    first: { name: string; createdAt: unknown },
    second: { name: string; createdAt: unknown },
  ) => {
    if (createdAtSort !== "none") {
      const dateComparison = String(first.createdAt).localeCompare(
        String(second.createdAt),
      );
      if (dateComparison !== 0) {
        return createdAtSort === "asc" ? dateComparison : -dateComparison;
      }
    }
    return 0;
  };

  const filteredCategories = categories
    .map((category) => {
      const categoryMatchesSearch =
        !normalizedSearchTerm ||
        category.name.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm);
      const categoryMatchesFilter =
        selectedCategoryIds === null ||
        selectedCategoryIds.includes(category.id);
      const categoryItems = items.filter(
        (item) => item.category?.id === category.id,
      );
      return {
        category,
        items: categoryItems.sort(compareBySortOption),
        visible: categoryMatchesSearch && categoryMatchesFilter,
      };
    })
    .filter(({ visible }) => visible)
    .sort((first, second) => compareBySortOption(first.category, second.category));
  const allCategoryIds = categories.map((category) => category.id);
  const selectedCategories =
    selectedCategoryIds === null
      ? categories
      : categories.filter((category) =>
          selectedCategoryIds.includes(category.id),
        );
  const categoryFilterLabel =
    selectedCategoryIds === null
      ? "Todas as atividades"
      : selectedCategories.length === 0
        ? "Nenhuma atividade"
        : selectedCategories.length === 1
          ? selectedCategories[0].name
          : `${selectedCategories.length} atividades`;
  const hasActiveFilters =
    Boolean(normalizedSearchTerm) ||
    createdAtSort !== "asc" ||
    selectedCategoryIds !== null;

  const renderItem = (item: TodoItem) => (
    <ListItem
      key={item.id}
      divider
      secondaryAction={
        <Stack direction="row">
          {!item.isResolved && (
            <>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => openEditItem(item)}
              >
                Editar
              </Button>
              <Button
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() =>
                  setDeleteTarget({ type: "item", id: item.id, name: item.name })
                }
              >
                Excluir
              </Button>
            </>
          )}
        </Stack>
      }
    >
      <Checkbox
        checked={item.isResolved}
        onChange={() => void toggleItemResolved(item)}
        disabled={saving}
        inputProps={{ "aria-label": `Mark ${item.name} as resolved` }}
      />
      <ListItemText
        primary={item.name}
        sx={{
          textDecoration: item.isResolved ? "line-through" : "none",
        }}
      />
    </ListItem>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Toolbar disableGutters sx={{ justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Lista de TODOs
          </Typography>
          <Typography color="text.secondary">
            Gerencie suas tarefas e atividades.
          </Typography>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <ThemeSelector />
          <Button component={NextLink} href="/" variant="outlined">
            Dashboard
          </Button>
          <Button
            component={NextLink}
            href="/todos/activities/new"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Nova Atividade
          </Button>
        </Stack>
      </Toolbar>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ md: "center" }}
              >
                <TextField
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  label="Buscar atividades"
                  placeholder="Digite um nome"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <Button
                  id="category-filter-button"
                  variant="outlined"
                  endIcon={<FilterListIcon />}
                  onClick={(event) =>
                    setCategoryFilterAnchor(event.currentTarget)
                  }
                  sx={{
                    minWidth: { md: 220 },
                    justifyContent: "space-between",
                    textTransform: "none",
                  }}
                >
                  {categoryFilterLabel}
                </Button>
                <Menu
                  anchorEl={categoryFilterAnchor}
                  open={Boolean(categoryFilterAnchor)}
                  onClose={() => setCategoryFilterAnchor(null)}
                  MenuListProps={{ "aria-labelledby": "category-filter-button" }}
                  PaperProps={{ sx: { minWidth: 280, maxHeight: 420 } }}
                >
                  <MenuItem
                    onClick={() => setSelectedCategoryIds(null)}
                    sx={{ fontWeight: selectedCategoryIds === null ? 700 : 400 }}
                  >
                    Todas as atividades
                  </MenuItem>
                  <Divider />
                  {categories.map((category) => {
                    const checked =
                      selectedCategoryIds === null ||
                      selectedCategoryIds.includes(category.id);
                    return (
                      <MenuItem
                        key={category.id}
                        selected={checked && selectedCategoryIds !== null}
                        onClick={() => {
                          const currentSelection =
                            selectedCategoryIds ?? allCategoryIds;
                          const nextSelection = checked
                            ? currentSelection.filter(
                                (id) => id !== category.id,
                              )
                            : [...currentSelection, category.id];
                          setSelectedCategoryIds(
                            nextSelection.length === allCategoryIds.length
                              ? null
                              : nextSelection,
                          );
                        }}
                      >
                        <Checkbox checked={checked} size="small" />
                        {category.name}
                      </MenuItem>
                    );
                  })}
                  <Divider />
                  <MenuItem
                    onClick={() => setSelectedCategoryIds([])}
                    sx={{
                      color: "error.main",
                      fontWeight:
                        selectedCategoryIds?.length === 0 ? 700 : 400,
                    }}
                  >
                    Limpar atividades
                  </MenuItem>
                </Menu>
                <FormControl size="small" sx={{ minWidth: { md: 220 } }}>
                  <InputLabel id="todo-created-sort-label">
                    Data de criação
                  </InputLabel>
                  <Select
                    labelId="todo-created-sort-label"
                    value={createdAtSort}
                    label="Data de criação"
                    onChange={(event) =>
                      setCreatedAtSort(event.target.value as SortDirection)
                    }
                  >
                    <MenuItem value="none">Nenhuma</MenuItem>
                    <MenuItem value="asc">Mais antiga primeiro</MenuItem>
                    <MenuItem value="desc">Mais recente primeiro</MenuItem>
                  </Select>
                </FormControl>
                {hasActiveFilters && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setSearchTerm("");
                      setCreatedAtSort("asc");
                      setSelectedCategoryIds(null);
                    }}
                    sx={{
                      minWidth: "auto",
                      whiteSpace: "nowrap",
                      color: "#991b1b",
                      borderColor: "#d99a9a",
                      backgroundColor: "#fce8e8",
                      px: 1.5,
                      "&:hover": {
                        color: "#7f1d1d",
                        borderColor: "#b91c1c",
                        backgroundColor: "#fbd5d5",
                      },
                    }}
                  >
                    Resetar filtros
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
          {filteredCategories.map(({ category, items: categoryItems }) => (
            <Card key={category.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={1}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {categoryItems.length} item(ns)
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      color={category.isResolved ? "success" : "primary"}
                      startIcon={
                        category.isResolved ? (
                          <CheckCircleIcon />
                        ) : (
                          <RadioButtonUncheckedIcon />
                        )
                      }
                      onClick={() => void toggleActivityResolved(category)}
                      disabled={saving || !categoryItems.length}
                    >
                      {category.isResolved ? "Concluída" : "Concluir atividade"}
                    </Button>
                    <Button
                      component={NextLink}
                      href={`/todos/activities/${category.id}`}
                      size="small"
                      startIcon={<EditIcon />}
                    >
                      Editar atividade
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() =>
                        setDeleteTarget({
                          type: "category",
                          id: category.id,
                          name: category.name,
                        })
                      }
                    >
                      Excluir
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => openNewItem(category.id)}
                    >
                      Adicionar item
                    </Button>
                  </Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                {categoryItems.length ? (
                  <List disablePadding>{categoryItems.map(renderItem)}</List>
                ) : (
                  <Typography color="text.secondary" sx={{ py: 1 }}>
                    Nenhum TODO nesta atividade. Adicione o primeiro item acima.
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}

          {!filteredCategories.length && (categories.length > 0 || items.length > 0) && (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Nenhum resultado encontrado.
                </Typography>
              </CardContent>
            </Card>
          )}

          {!categories.length && !items.length && (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Nenhuma atividade ou TODO criado ainda.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}

      <Dialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {itemDialogMode === "create" ? "Novo TODO" : "Editar TODO"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Nome"
              value={itemForm.name}
              onChange={(event) =>
                setItemForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              autoFocus
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="todo-category-label">Atividade</InputLabel>
              <Select
                labelId="todo-category-label"
                label="Atividade"
                value={itemForm.categoryId}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <label>
              <Checkbox
                checked={itemForm.isResolved}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    isResolved: event.target.checked,
                  }))
                }
              />
              Resolvido
            </label>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => void saveItem()} variant="contained" disabled={saving}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={
          deleteTarget?.type === "category"
            ? "Excluir atividade?"
            : "Excluir TODO?"
        }
        message={
          deleteTarget
            ? `Tem certeza de que deseja excluir "${deleteTarget.name}"?`
            : ""
        }
        loading={saving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === "category") {
            void deleteCategory(deleteTarget.id);
          } else {
            void deleteItem(deleteTarget.id);
          }
        }}
      />

      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {categoryDialogMode === "create" ? "Nova atividade" : "Editar atividade"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            autoFocus
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => void saveCategory()}
            variant="contained"
            disabled={saving}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
