"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === "function" ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GoogleSignInButton;
var react_1 = require("react");
var Button_1 = require("@mui/material/Button");
var Stack_1 = require("@mui/material/Stack");
var Alert_1 = require("@mui/material/Alert");
var CircularProgress_1 = require("@mui/material/CircularProgress");
var OpenInNew_1 = require("@mui/icons-material/OpenInNew");
var GoogleIcon_1 = require("@/components/GoogleIcon");
var AuthContext_1 = require("@/context/AuthContext");
var navigation_1 = require("next/navigation");
function GoogleSignInButton(_a) {
  var _this = this;
  var _b = _a.redirectAfterLogin,
    redirectAfterLogin = _b === void 0 ? "/" : _b,
    _c = _a.showDemoButton,
    showDemoButton = _c === void 0 ? true : _c;
  var _d = (0, AuthContext_1.useAuth)(),
    clientId = _d.clientId,
    loginWithGoogleCredential = _d.loginWithGoogleCredential,
    loginDemoUser = _d.loginDemoUser,
    loading = _d.loading,
    error = _d.error;
  var router = (0, navigation_1.useRouter)();
  var googleButtonRef = (0, react_1.useRef)(null);
  var _e = (0, react_1.useState)(false),
    gisLoaded = _e[0],
    setGisLoaded = _e[1];
  var _f = (0, react_1.useState)(""),
    currentOrigin = _f[0],
    setCurrentOrigin = _f[1];
  (0, react_1.useEffect)(function () {
    var _a, _b;
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin);
    }
    if (
      (_b =
        (_a = window.google) === null || _a === void 0
          ? void 0
          : _a.accounts) === null || _b === void 0
        ? void 0
        : _b.id
    ) {
      setGisLoaded(true);
      return;
    }
    var script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = function () {
      setGisLoaded(true);
    };
    document.body.appendChild(script);
  }, []);
  (0, react_1.useEffect)(
    function () {
      var _a, _b;
      if (
        !gisLoaded ||
        !clientId ||
        !((_b =
          (_a = window.google) === null || _a === void 0
            ? void 0
            : _a.accounts) === null || _b === void 0
          ? void 0
          : _b.id)
      )
        return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: function (response) {
            return __awaiter(_this, void 0, void 0, function () {
              var ok;
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    if (
                      !(response === null || response === void 0
                        ? void 0
                        : response.credential)
                    )
                      return [3 /*break*/, 2];
                    return [
                      4 /*yield*/,
                      loginWithGoogleCredential(response.credential),
                    ];
                  case 1:
                    ok = _a.sent();
                    if (ok) {
                      router.push(redirectAfterLogin);
                    }
                    _a.label = 2;
                  case 2:
                    return [2 /*return*/];
                }
              });
            });
          },
        });
        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            locale: "pt-BR",
          });
        }
      } catch (e) {
        console.warn("Aviso GIS:", e);
      }
    },
    [
      gisLoaded,
      clientId,
      loginWithGoogleCredential,
      redirectAfterLogin,
      router,
    ],
  );
  // Standard OAuth 2.0 redirect flow (not affected by GIS iframe blocking)
  var handleRedirectOAuth = function () {
    if (!clientId) return;
    var origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    var redirectUri = "".concat(origin, "/auth/callback");
    var authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      "client_id=".concat(clientId, "&") +
      "redirect_uri=".concat(encodeURIComponent(redirectUri), "&") +
      "response_type=code&" +
      "scope=openid%20email%20profile&" +
      "access_type=online&" +
      "prompt=select_account";
    window.location.href = authUrl;
  };
  return (
    <Stack_1.default spacing={2} sx={{ width: "100%" }}>
      {error && (
        <Alert_1.default severity="error" sx={{ fontSize: "0.85rem" }}>
          {error}
        </Alert_1.default>
      )}

      {/* Alternative button: OAuth 2.0 direct redirect flow */}
      <Button_1.default
        fullWidth
        variant="outlined"
        startIcon={
          loading ? (
            <CircularProgress_1.default size={20} />
          ) : (
            <GoogleIcon_1.default />
          )
        }
        endIcon={<OpenInNew_1.default sx={{ fontSize: 16 }} />}
        onClick={handleRedirectOAuth}
        disabled={loading || !clientId}
        sx={{
          py: 1.2,
          borderColor: "#cbd5e1",
          color: "#334155",
          fontWeight: 600,
          "&:hover": {
            borderColor: "#94a3b8",
            backgroundColor: "#f8fafc",
          },
        }}
      >
        {loading ? "Processando..." : "Entrar com Google"}
      </Button_1.default>
    </Stack_1.default>
  );
}
