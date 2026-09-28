"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Image from "next/image";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import ThemeSelector from "@/components/ThemeSelector";
import demo from "@/static/images/demo.gif";

const benefits = [
  "Crie listas para cada projeto ou parte da sua rotina.",
  "Divida suas atividades em tarefas fáceis de acompanhar.",
  "Marque o que já fez e visualize seu progresso.",
];

export default function SignIn() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        height: { md: "100dvh" },
        overflow: { md: "hidden" },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 7fr) minmax(0, 5fr)" },
        bgcolor: "background.default",
      }}
    >
      <Box
        component="section"
        aria-labelledby="todo-intro-title"
        sx={{
          order: { xs: 2, md: 1 },
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "safe center",
          gap: { xs: 3, md: "clamp(16px, 3dvh, 32px)" },
          p: { xs: 3, sm: 4, md: "clamp(24px, 4dvh, 48px)" },
          minWidth: 0,
          minHeight: 0,
          overflowY: { md: "auto" },
          "& > *": { flexShrink: 0 },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ChecklistRoundedIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" fontWeight={700}>
            TODO
          </Typography>
          <Chip
            label="Um dia mais organizado"
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#e0f2fe" }}
          />
        </Stack>

        <Box sx={{ maxWidth: 620 }}>
          <Typography
            id="todo-intro-title"
            component="h4"
            sx={{
              fontSize: { xs: "2rem", lg: "2.5rem" },
              lineHeight: 1.15,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              mb: 2,
            }}
          >
            Menos tarefas na cabeça.
            <br />
            Mais espaço para realizar.
          </Typography>
          <Typography sx={{ color: "#cbd5e1", lineHeight: 1.8, mb: 3 }}>
            Organize suas atividades em listas e tenha clareza sobre o que
            precisa fazer. Com o TODO, fica mais fácil planejar a rotina,
            acompanhar cada etapa e transformar pequenos passos em um dia mais
            produtivo.
          </Typography>
          <Stack
            component="ul"
            spacing={1.5}
            sx={{ m: 0, p: 0, listStyle: "none" }}
          >
            {benefits.map((benefit) => (
              <Stack
                component="li"
                key={benefit}
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
              >
                <CheckCircleOutlineIcon
                  sx={{
                    color: "#7dd3fc",
                    fontSize: 21,
                    flexShrink: 0,
                    mt: 0.2,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "#e2e8f0", lineHeight: 1.6 }}
                >
                  {benefit}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box
          component="figure"
          sx={{
            m: 0,
            width: "100%",
            maxWidth: 800,
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              overflow: "hidden",
              borderRadius: 2,
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              bgcolor: "#0f172a",
            }}
          >
            <Image
              src={demo}
              alt="Demonstração do TODO: organização de listas e atividades na aplicação."
              unoptimized
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "auto",
                maxHeight: "30dvh",
                objectFit: "contain",
              }}
            />
          </Box>
          <Typography
            component="figcaption"
            variant="caption"
            sx={{ display: "block", mt: 1.5, color: "#cbd5e1" }}
          >
            Veja como é simples organizar suas atividades em um só lugar.
          </Typography>
        </Box>
      </Box>

      <Box
        component="section"
        aria-labelledby="sign-in-title"
        sx={{
          order: { xs: 1, md: 2 },
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          p: { xs: 3, sm: 4, md: "clamp(20px, 4dvh, 48px)" },
          minWidth: 0,
          minHeight: { xs: "100dvh", md: 0 },
          // Keep controls reachable on unusually short screens or with zoom.
          overflowY: { md: "auto" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 2,
            flexShrink: 0,
          }}
        >
          <ThemeSelector />
        </Box>
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            mx: "auto",
            my: "auto",
            py: 2,
            flexShrink: 0,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 48,
              height: 48,
              mb: 3,
              mx: "auto",
            }}
          >
            <LockOutlinedIcon />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            id="sign-in-title"
            sx={{ mb: 1.5 }}
          >
            Seu dia começa aqui.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
            Entre com sua conta Google para acessar suas listas e dar o próximo
            passo nas suas atividades.
          </Typography>
          <GoogleSignInButton redirectAfterLogin="/" />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, textAlign: "center" }}
          >
            Uma tarefa de cada vez. Cada conquista conta.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
