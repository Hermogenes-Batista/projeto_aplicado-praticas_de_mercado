"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  TodoActivitiesDocument,
  TodoActivitiesQuery,
} from "@/graphql/generated";
import ActivityCountdown from "@/components/ActivityCountdown";

type TodoActivities = NonNullable<TodoActivitiesQuery["activities"][number]>;
type TodoItem = NonNullable<
  Exclude<
    Exclude<NonNullable<TodoActivitiesQuery>["activities"], null>[number],
    null
  >["items"]
>[number];

export default function Dashboard() {
  const [items, setItems] = React.useState<TodoItem[]>([]);
  const [activities, setActivities] = React.useState<TodoActivities[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { token, requestAuthenticatedGraphQL } = useAuth();

  const fetchTodoMetrics = React.useCallback(async () => {
    if (!token) {
      setItems([]);
      setActivities([]);
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
      const validActivities = activitiesData.activities.filter(
        (activity): activity is TodoActivities => activity !== null,
      );

      setItems(
        validActivities.flatMap((activity) => {
          return (
            activity.items?.filter((item): item is TodoItem => item !== null) ??
            []
          );
        }),
      );
      setActivities(validActivities);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao carregar os TODOs.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestAuthenticatedGraphQL, token]);

  React.useEffect(() => {
    void fetchTodoMetrics();
  }, [fetchTodoMetrics]);

  const resolvedCount = items.filter((item) => item.isResolved).length;
  const pendingCount = items.length - resolvedCount;
  const resolvedPercentage = items.length
    ? Math.round((resolvedCount / items.length) * 100)
    : 0;
  const pendingPercentage = items.length ? 100 - resolvedPercentage : 0;
  const activityMetrics = activities.map((activity) => {
    const activityItems = items.filter(
      (item) => item.activity?.id === activity.id,
    );
    const resolved = activityItems.filter((item) => item.isResolved).length;
    return {
      ...activity,
      total: activityItems.length,
      resolved,
      pending: activityItems.length - resolved,
    };
  });

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 3 } }}>
      <Card>
        <CardHeader
          title="Métricas dos TODOs"
          subheader={
            token
              ? "Resumo dos itens da sua lista"
              : "Faça login para visualizar suas métricas"
          }
          titleTypographyProps={{ variant: "h6", fontWeight: 700 }}
          action={
            token ? (
              <Button
                size="small"
                startIcon={
                  loading ? <CircularProgress size={16} /> : <RefreshIcon />
                }
                onClick={() => void fetchTodoMetrics()}
                disabled={loading}
              >
                Atualizar
              </Button>
            ) : undefined
          }
        />
        <Divider />
        <CardContent>
          {error && <Alert severity="error">{error}</Alert>}
          {!token ? (
            <Typography color="text.secondary">
              Os gráficos serão exibidos após a autenticação.
            </Typography>
          ) : loading && !items.length ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Resumo global dos itens
                    </Typography>
                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">
                          Resolvidos: <strong>{resolvedCount}</strong> (
                          {resolvedPercentage}%)
                        </Typography>
                        <Typography variant="body2">
                          Pendentes: <strong>{pendingCount}</strong> (
                          {pendingPercentage}%)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={resolvedPercentage}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: "#f59e0b",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#16a34a",
                            borderRadius: 6,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Total global: {items.length} item(ns)
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              {activityMetrics.map((activity) => {
                const resolvedPercentage = activity.total
                  ? Math.round((activity.resolved / activity.total) * 100)
                  : 0;
                const pendingPercentage = activity.total
                  ? 100 - resolvedPercentage
                  : 0;
                return (
                  <Grid item xs={12} md={6} key={activity.name}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography
                          component={NextLink}
                          href={`/todos/activities/${activity.id}`}
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{
                            color: "primary.main",
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          {activity.name}
                        </Typography>
                        <ActivityCountdown dueDate={activity.dueDate} />
                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">
                              Resolvidos: <strong>{activity.resolved}</strong> (
                              {resolvedPercentage}%)
                            </Typography>
                            <Typography variant="body2">
                              Pendentes: <strong>{activity.pending}</strong> (
                              {pendingPercentage}%)
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={resolvedPercentage}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: "#f59e0b",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: "#16a34a",
                                borderRadius: 5,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Total de itens na atividade: {activity.total}{" "}
                            item(ns)
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
