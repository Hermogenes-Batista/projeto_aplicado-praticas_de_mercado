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
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditIcon from "@mui/icons-material/Edit";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import ActivityCountdown from "@/components/ActivityCountdown";
import ActivityDueDateField from "@/components/ActivityDueDateField";
import { fromDateTimeLocal, toDateTimeLocal } from "@/utils/activityDueDate";
import {
  CompleteTodoActivityDocument,
  CompleteTodoActivityMutation,
  CreateTodoActivityDocument,
  CreateTodoActivityMutation,
  CreateTodoItemDocument,
  CreateTodoItemMutation,
  DeleteTodoItemDocument,
  DeleteTodoItemMutation,
  TodoActivitiesDocument,
  TodoActivitiesQuery,
  UpdateTodoActivityDocument,
  UpdateTodoActivityMutation,
  UpdateTodoItemDocument,
  UpdateTodoItemMutation,
} from "@/graphql/generated";
import { useMediaQuery } from "@mui/system";

type Activity = NonNullable<TodoActivitiesQuery["activities"][number]>;
type TodoItem = NonNullable<
  Exclude<
    Exclude<NonNullable<TodoActivitiesQuery>["activities"], null>[number],
    null
  >["items"]
>[number];

export default function ActivityTodosPage() {
  const params = useParams<{ activityId: string }>();
  const router = useRouter();
  const { requestAuthenticatedGraphQL } = useAuth();
  const activityId = params.activityId;
  const isNewActivity = activityId === "new";
  const [activity, setActivity] = useState<Activity | null>(null);
  const [items, setItems] = useState<TodoItem[]>([]);
  const [activityName, setActivityName] = useState("");
  const [activityDueDate, setActivityDueDate] = useState("");
  const [editingActivityName, setEditingActivityName] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [pendingItems, setPendingItems] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const errorsFrom = (errors: Array<string | null> | undefined) =>
    errors?.filter((message): message is string => Boolean(message)).join(", ");

  const loadActivity = useCallback(async () => {
    if (isNewActivity) {
      setLoading(false);
      setEditingActivityName(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [activitiesData] = await Promise.all([
        requestAuthenticatedGraphQL<TodoActivitiesQuery>(
          TodoActivitiesDocument,
        ),
      ]);
      const selectedActivity = activitiesData.activities.find(
        (item): item is Activity => item?.id === activityId,
      );
      if (!selectedActivity) {
        throw new Error("Atividade não encontrada.");
      }
      setActivity(selectedActivity);
      setActivityName(selectedActivity.name);
      setActivityDueDate(toDateTimeLocal(selectedActivity.dueDate));
      setItems(selectedActivity.items);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Falha ao carregar a atividade.",
      );
    } finally {
      setLoading(false);
    }
  }, [activityId, isNewActivity, requestAuthenticatedGraphQL]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const saveActivity = async () => {
    if (!activityName.trim() || (!activity && !isNewActivity)) return;
    setSaving(true);
    setError(null);
    try {
      if (isNewActivity) {
        const variables = {
          name: activityName.trim(),
          dueDate: fromDateTimeLocal(activityDueDate),
          items: pendingItems.map((itemName) => {
            return { name: itemName, isResolved: false };
          }),
        };
        const activityData =
          await requestAuthenticatedGraphQL<CreateTodoActivityMutation>(
            CreateTodoActivityDocument,
            variables,
          );
        const activityErrors = errorsFrom(activityData.createActivity?.errors);
        const createdActivity = activityData.createActivity?.activity;
        if (activityErrors || !createdActivity) {
          throw new Error(activityErrors || "Falha ao criar a atividade.");
        }

        router.push(`/todos/activities/${createdActivity.id}`);
        return;
      }

      const data =
        await requestAuthenticatedGraphQL<UpdateTodoActivityMutation>(
          UpdateTodoActivityDocument,
          {
            id: activity!.id,
            name: activityName.trim(),
            dueDate: fromDateTimeLocal(activityDueDate),
          },
        );
      const errors = errorsFrom(data.updateActivity?.errors);
      if (errors) throw new Error(errors);
      setEditingActivityName(false);
      await loadActivity();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao salvar a atividade.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveDueDate = async () => {
    if (!activity) return;
    setSaving(true);
    setError(null);
    try {
      const data =
        await requestAuthenticatedGraphQL<UpdateTodoActivityMutation>(
          UpdateTodoActivityDocument,
          {
            id: activity.id,
            name: activity.name,
            dueDate: fromDateTimeLocal(activityDueDate),
          },
        );
      const errors = errorsFrom(data.updateActivity?.errors);
      if (errors) throw new Error(errors);
      setEditingDueDate(false);
      await loadActivity();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao salvar o prazo.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addItem = async () => {
    if (!newItemName.trim()) return;
    if (isNewActivity) {
      setPendingItems((currentItems) => [...currentItems, newItemName.trim()]);
      setNewItemName("");
      return;
    }
    if (!activity) return;
    setSaving(true);
    setError(null);
    try {
      const data = await requestAuthenticatedGraphQL<CreateTodoItemMutation>(
        CreateTodoItemDocument,
        {
          name: newItemName.trim(),
          activityId: activity.id,
          isResolved: false,
        },
      );
      const errors = errorsFrom(data.createItem?.errors);
      if (errors) throw new Error(errors);
      setNewItemName("");
      await loadActivity();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao adicionar o item.",
      );
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
          activityId: activityId,
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
      setError(
        cause instanceof Error ? cause.message : "Falha ao atualizar o item.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleActivityResolved = async () => {
    if (!activity) return;
    setSaving(true);
    setError(null);
    try {
      const data =
        await requestAuthenticatedGraphQL<CompleteTodoActivityMutation>(
          CompleteTodoActivityDocument,
          { id: activity.id, isResolved: !activity.isResolved },
        );
      const errors = errorsFrom(data.completeActivity?.errors);
      if (errors) throw new Error(errors);
      await loadActivity();
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
          activityId,
          isResolved: item.isResolved,
        },
      );
      const errors = errorsFrom(data.updateItem?.errors);
      if (errors) throw new Error(errors);
      setEditingItemId(null);
      await loadActivity();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao editar o item.",
      );
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
      await loadActivity();
      setDeleteItemId(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao excluir o item.",
      );
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
    <Container maxWidth="md" sx={{ py: 4, px: { xs: 1, sm: 3 } }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button
          component={NextLink}
          href="/todos"
          startIcon={<ArrowBackIcon />}
        >
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

      {activity || isNewActivity ? (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                {isNewActivity ? "Nova atividade" : "Atividade"}
              </Typography>
              {isNewActivity || editingActivityName ? (
                <Stack
                  direction={{ xs: "column", sm: "column" }}
                  spacing={2}
                  sx={{ mt: 1 }}
                >
                  <TextField
                    value={activityName}
                    onChange={(event) => setActivityName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !isNewActivity) {
                        void saveActivity();
                      }
                      if (event.key === "Escape" && !isNewActivity) {
                        setActivityName(activity!.name);
                        setEditingActivityName(false);
                      }
                    }}
                    fullWidth
                    autoFocus
                    label="Nome da atividade"
                  />
                  {isNewActivity && (
                    <ActivityDueDateField
                      label="Prazo (opcional)"
                      value={activityDueDate}
                      onChange={setActivityDueDate}
                      helperText="Nas últimas 24 horas, a contagem regressiva mostra horas."
                    />
                  )}
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => void saveActivity()}
                      disabled={saving}
                    >
                      Salvar
                    </Button>
                    {!isNewActivity && (
                      <Button
                        onClick={() => {
                          setActivityName(activity!.name);
                          setEditingActivityName(false);
                        }}
                        disabled={saving}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ mt: 1 }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    {activity!.name}
                  </Typography>
                  <IconButton
                    aria-label="Editar nome da atividade"
                    onClick={() => {
                      setActivityName(activity!.name);
                      setEditingActivityName(true);
                    }}
                    disabled={saving}
                  >
                    <EditIcon />
                  </IconButton>
                  <Button
                    size="small"
                    color={activity!.isResolved ? "success" : "primary"}
                    startIcon={
                      activity!.isResolved ? (
                        <CheckCircleIcon />
                      ) : (
                        <RadioButtonUncheckedIcon />
                      )
                    }
                    onClick={() => void toggleActivityResolved()}
                    disabled={saving || !items.length}
                  >
                    {activity!.isResolved ? "Concluída" : "Concluir atividade"}
                  </Button>
                </Stack>
              )}
              {!isNewActivity && !editingActivityName && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ sm: "center" }}
                  spacing={1}
                  sx={{ mt: 2 }}
                >
                  <ScheduleIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Prazo:
                  </Typography>
                  {activity!.dueDate ? (
                    <ActivityCountdown dueDate={activity!.dueDate} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sem prazo definido
                    </Typography>
                  )}
                  {!editingDueDate && (
                    <Button
                      size="small"
                      onClick={() => {
                        setActivityDueDate(toDateTimeLocal(activity!.dueDate));
                        setEditingDueDate(true);
                      }}
                      disabled={saving}
                    >
                      {activity!.dueDate ? "Editar prazo" : "Definir prazo"}
                    </Button>
                  )}
                </Stack>
              )}
              {!isNewActivity && editingDueDate && !editingActivityName && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  alignItems={{ sm: "flex-start" }}
                  spacing={1}
                  sx={{ mt: 2 }}
                >
                  <ActivityDueDateField
                    label="Prazo da atividade"
                    value={activityDueDate}
                    onChange={setActivityDueDate}
                    size="small"
                    disabled={saving}
                  />
                  <Button
                    variant="contained"
                    onClick={() => void saveDueDate()}
                    disabled={saving}
                  >
                    Salvar
                  </Button>
                  <Button
                    onClick={() => {
                      setActivityDueDate(toDateTimeLocal(activity!.dueDate));
                      setEditingDueDate(false);
                    }}
                    disabled={saving}
                  >
                    Cancelar
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
                  <ListItem key={item.id} divider>
                    <Checkbox
                      checked={item.isResolved}
                      onChange={() => void toggleItem(item)}
                      disabled={saving}
                    />
                    <Stack direction="row" spacing={1} width={"100%"}>
                      {editingItemId === item.id ? (
                        <TextField
                          value={editingItemName}
                          onChange={(event) =>
                            setEditingItemName(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") void saveItem(item);
                            else if (event.key === "Escape") {
                              setEditingItemId(null);
                              setEditingItemName("");
                            }
                          }}
                          size="small"
                          fullWidth
                          style={{
                            display: "flex",
                          }}
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
                      {!item.isResolved && (
                        <Stack direction="row" spacing={1}>
                          {editingItemId === item.id &&
                            (isMobile ? (
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => saveItem(item)}
                                disabled={item.isResolved}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            ) : (
                              <Button
                                size="small"
                                startIcon={<SaveIcon />}
                                onClick={() => saveItem(item)}
                                disabled={item.isResolved}
                              >
                                Salvar
                              </Button>
                            ))}

                          {isMobile ? (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setEditingItemName(item.name);
                                }}
                                disabled={item.isResolved}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteItemId(item.id)}
                                disabled={item.isResolved}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </Stack>
                      )}
                    </Stack>
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
