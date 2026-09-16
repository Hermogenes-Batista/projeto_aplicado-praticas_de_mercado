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
  CreateTodoActivityDocument,
  CreateTodoActivityMutation,
  CompleteTodoActivityDocument,
  CompleteTodoActivityMutation,
  CreateTodoItemDocument,
  CreateTodoItemMutation,
  DeleteTodoActivityDocument,
  DeleteTodoActivityMutation,
  DeleteTodoItemDocument,
  DeleteTodoItemMutation,
  TodoActivitiesDocument,
  TodoActivitiesQuery,
  TodoItemsDocument,
  TodoItemsQuery,
  UpdateTodoActivityDocument,
  UpdateTodoActivityMutation,
  UpdateTodoItemDocument,
  UpdateTodoItemMutation,
} from "@/graphql/generated";

type Activity = NonNullable<TodoActivitiesQuery["activities"][number]>;
type TodoItem = NonNullable<TodoItemsQuery["items"][number]>;
type DialogMode = "create" | "edit";
type SortDirection = "none" | "asc" | "desc";

interface ItemForm {
  id?: string;
  name: string;
  activityId: string;
  isResolved: boolean;
}

type DeleteTarget =
  | { type: "item"; id: string; name: string }
  | { type: "Activity"; id: string; name: string }
  | null;

export default function TodosPage() {
  const { requestAuthenticatedGraphQL } = useAuth();
  const [items, setItems] = useState<TodoItem[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>({
    name: "",
    activityId: "",
    isResolved: false,
  });
  const [ActivityName, setActivityName] = useState("");
  const [activityId, setActivityId] = useState<string | undefined>();
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [ActivityDialogOpen, setActivityDialogOpen] = useState(false);
  const [itemDialogMode, setItemDialogMode] = useState<DialogMode>("create");
  const [ActivityDialogMode, setActivityDialogMode] =
    useState<DialogMode>("create");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [createdAtSort, setCreatedAtSort] =
    useState<SortDirection>("asc");
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[] | null>(
    null,
  );
  const [ActivityFilterAnchor, setActivityFilterAnchor] =
    useState<null | HTMLElement>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, activitiesData] = await Promise.all([
        requestAuthenticatedGraphQL<TodoItemsQuery>(TodoItemsDocument, {
          isResolved: null,
        }),
        requestAuthenticatedGraphQL<TodoActivitiesQuery>(
          TodoActivitiesDocument,
        ),
      ]);
      setItems(
        itemsData.items.filter((item): item is TodoItem => item !== null),
      );
      setActivities(
        activitiesData.activities.filter(
          (activity): activity is Activity => activity !== null,
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
    if (!itemForm.name.trim() || !itemForm.activityId) {
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
            activityId: itemForm.activityId,
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
            ActivityId: itemForm.activityId,
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

  const saveActivity = async () => {
    if (!ActivityName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (ActivityDialogMode === "create") {
        const data =
          await requestAuthenticatedGraphQL<CreateTodoActivityMutation>(
            CreateTodoActivityDocument,
            { name: ActivityName.trim() },
          );
        const errors = mutationErrors(data.createActivity?.errors);
        if (errors) throw new Error(errors);
      } else if (activityId) {
        const data =
          await requestAuthenticatedGraphQL<UpdateTodoActivityMutation>(
            UpdateTodoActivityDocument,
            { id: activityId, name: ActivityName.trim() },
          );
        const errors = mutationErrors(data.updateActivity?.errors);
        if (errors) throw new Error(errors);
      }
      setActivityDialogOpen(false);
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

  const deleteActivity = async (id: string) => {
    const data =
      await requestAuthenticatedGraphQL<DeleteTodoActivityMutation>(
        DeleteTodoActivityDocument,
        { id },
      );
    const errors = mutationErrors(data.deleteActivity?.errors);
    if (!data.deleteActivity?.success || errors) {
      setError(errors || "Falha ao excluir a atividade.");
      return;
    }
    await loadData();
    setDeleteTarget(null);
  };

  const toggleItemResolved = async (item: TodoItem) => {
    if (!item.activity?.id) {
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
          activityId: item.activity.id,
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

  const toggleActivityResolved = async (activity: Activity) => {
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

  const openNewItem = (activityId = activities[0]?.id || "") => {
    setItemForm({ name: "", activityId, isResolved: false });
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
      activityId: item.activity?.id || "",
      isResolved: item.isResolved,
    });
    setItemDialogMode("edit");
    setItemDialogOpen(true);
  };

  const openActivity = (Activity?: Activity) => {
    setActivityId(Activity?.id);
    setActivityName(Activity?.name || "");
    setActivityDialogMode(Activity ? "edit" : "create");
    setActivityDialogOpen(true);
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

  const filteredActivities = activities
    .map((activity) => {
      const ActivityMatchesSearch =
        !normalizedSearchTerm ||
        activity.name.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm);
      const ActivityMatchesFilter =
        selectedActivityIds === null ||
        selectedActivityIds.includes(activity.id);
      const ActivityItems = items.filter(
        (item) => item.activity?.id === activity.id,
      );
      return {
        activity,
        items: ActivityItems.sort(compareBySortOption),
        visible: ActivityMatchesSearch && ActivityMatchesFilter,
      };
    })
    .filter(({ visible }) => visible)
    .sort((first, second) => compareBySortOption(first.activity, second.activity));
  const allActivityIds = activities.map((activity) => activity.id);
  const selectedActivities =
    selectedActivityIds === null
      ? activities
      : activities.filter((activity) =>
          selectedActivityIds.includes(activity.id),
        );
  const ActivityFilterLabel =
    selectedActivityIds === null
      ? "Todas as atividades"
      : selectedActivities.length === 0
        ? "Nenhuma atividade"
        : selectedActivities.length === 1
          ? selectedActivities[0].name
          : `${selectedActivities.length} atividades`;
  const hasActiveFilters =
    Boolean(normalizedSearchTerm) ||
    createdAtSort !== "asc" ||
    selectedActivityIds !== null;

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
                  id="Activity-filter-button"
                  variant="outlined"
                  endIcon={<FilterListIcon />}
                  onClick={(event) =>
                    setActivityFilterAnchor(event.currentTarget)
                  }
                  sx={{
                    minWidth: { md: 220 },
                    justifyContent: "space-between",
                    textTransform: "none",
                  }}
                >
                  {ActivityFilterLabel}
                </Button>
                <Menu
                  anchorEl={ActivityFilterAnchor}
                  open={Boolean(ActivityFilterAnchor)}
                  onClose={() => setActivityFilterAnchor(null)}
                  MenuListProps={{ "aria-labelledby": "Activity-filter-button" }}
                  PaperProps={{ sx: { minWidth: 280, maxHeight: 420 } }}
                >
                  <MenuItem
                    onClick={() => setSelectedActivityIds(null)}
                    sx={{ fontWeight: selectedActivityIds === null ? 700 : 400 }}
                  >
                    Todas as atividades
                  </MenuItem>
                  <Divider />
                  {activities.map((activity) => {
                    const checked =
                      selectedActivityIds === null ||
                      selectedActivityIds.includes(activity.id);
                    return (
                      <MenuItem
                        key={activity.id}
                        selected={checked && selectedActivityIds !== null}
                        onClick={() => {
                          const currentSelection =
                            selectedActivityIds ?? allActivityIds;
                          const nextSelection = checked
                            ? currentSelection.filter(
                                (id) => id !== activity.id,
                              )
                            : [...currentSelection, activity.id];
                          setSelectedActivityIds(
                            nextSelection.length === allActivityIds.length
                              ? null
                              : nextSelection,
                          );
                        }}
                      >
                        <Checkbox checked={checked} size="small" />
                        {activity.name}
                      </MenuItem>
                    );
                  })}
                  <Divider />
                  <MenuItem
                    onClick={() => setSelectedActivityIds([])}
                    sx={{
                      color: "error.main",
                      fontWeight:
                        selectedActivityIds?.length === 0 ? 700 : 400,
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
                      setSelectedActivityIds(null);
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
          {filteredActivities.map(({ activity, items: ActivityItems }) => (
            <Card key={activity.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={1}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {activity.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ActivityItems.length} item(ns)
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      color={activity.isResolved ? "success" : "primary"}
                      startIcon={
                        activity.isResolved ? (
                          <CheckCircleIcon />
                        ) : (
                          <RadioButtonUncheckedIcon />
                        )
                      }
                      onClick={() => void toggleActivityResolved(activity)}
                      disabled={saving || !ActivityItems.length}
                    >
                      {activity.isResolved ? "Concluída" : "Concluir atividade"}
                    </Button>
                    <Button
                      component={NextLink}
                      href={`/todos/activities/${activity.id}`}
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
                          type: "Activity",
                          id: activity.id,
                          name: activity.name,
                        })
                      }
                    >
                      Excluir
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => openNewItem(activity.id)}
                    >
                      Adicionar item
                    </Button>
                  </Stack>
                </Stack>
                <Divider sx={{ my: 2 }} />
                {ActivityItems.length ? (
                  <List disablePadding>{ActivityItems.map(renderItem)}</List>
                ) : (
                  <Typography color="text.secondary" sx={{ py: 1 }}>
                    Nenhum TODO nesta atividade. Adicione o primeiro item acima.
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}

          {!filteredActivities.length && (activities.length > 0 || items.length > 0) && (
            <Card>
              <CardContent>
                <Typography color="text.secondary">
                  Nenhum resultado encontrado.
                </Typography>
              </CardContent>
            </Card>
          )}

          {!activities.length && !items.length && (
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
              <InputLabel id="todo-Activity-label">Atividade</InputLabel>
              <Select
                labelId="todo-Activity-label"
                label="Atividade"
                value={itemForm.activityId}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    ActivityId: event.target.value,
                  }))
                }
              >
                {activities.map((activity) => (
                  <MenuItem key={activity.id} value={activity.id}>
                    {activity.name}
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
          deleteTarget?.type === "Activity"
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
          if (deleteTarget.type === "Activity") {
            void deleteActivity(deleteTarget.id);
          } else {
            void deleteItem(deleteTarget.id);
          }
        }}
      />

      <Dialog
        open={ActivityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {ActivityDialogMode === "create" ? "Nova atividade" : "Editar atividade"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={ActivityName}
            onChange={(event) => setActivityName(event.target.value)}
            autoFocus
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => void saveActivity()}
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
