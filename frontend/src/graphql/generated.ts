/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
  UUID: { input: string; output: string };
};

export type ActivityType = {
  __typename?: "ActivityType";
  createdAt: Scalars["DateTime"]["output"];
  createdBy: UserType;
  dueDate?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["UUID"]["output"];
  isResolved: Scalars["Boolean"]["output"];
  items: Array<ItemType>;
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type CompleteActivity = {
  __typename?: "CompleteActivity";
  activity?: Maybe<ActivityType>;
  errors: Array<Maybe<Scalars["String"]["output"]>>;
};

export type CreateActivity = {
  __typename?: "CreateActivity";
  activity?: Maybe<ActivityType>;
  errors: Array<Maybe<Scalars["String"]["output"]>>;
};

export type CreateItem = {
  __typename?: "CreateItem";
  errors: Array<Maybe<Scalars["String"]["output"]>>;
  item?: Maybe<ItemType>;
};

export type DeleteActivity = {
  __typename?: "DeleteActivity";
  errors: Array<Maybe<Scalars["String"]["output"]>>;
  success: Scalars["Boolean"]["output"];
};

export type DeleteItem = {
  __typename?: "DeleteItem";
  errors: Array<Maybe<Scalars["String"]["output"]>>;
  success: Scalars["Boolean"]["output"];
};

export type GoogleLoginMutation = {
  __typename?: "GoogleLoginMutation";
  access?: Maybe<Scalars["String"]["output"]>;
  errors: Array<Maybe<Scalars["String"]["output"]>>;
  refresh?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
  user?: Maybe<UserType>;
};

export type ItemInput = {
  isResolved?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
};

export type ItemType = {
  __typename?: "ItemType";
  activity: ActivityType;
  createdAt: Scalars["DateTime"]["output"];
  createdBy: UserType;
  id: Scalars["UUID"]["output"];
  isResolved: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type LoginMutation = {
  __typename?: "LoginMutation";
  access?: Maybe<Scalars["String"]["output"]>;
  errors: Array<Maybe<Scalars["String"]["output"]>>;
  refresh?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
  user?: Maybe<UserType>;
};

export type LogoutMutation = {
  __typename?: "LogoutMutation";
  errors: Array<Maybe<Scalars["String"]["output"]>>;
  success: Scalars["Boolean"]["output"];
};

export type MutationRoot = {
  __typename?: "MutationRoot";
  completeActivity?: Maybe<CompleteActivity>;
  createActivity?: Maybe<CreateActivity>;
  createItem?: Maybe<CreateItem>;
  deleteActivity?: Maybe<DeleteActivity>;
  deleteItem?: Maybe<DeleteItem>;
  login?: Maybe<LoginMutation>;
  loginWithGoogle?: Maybe<GoogleLoginMutation>;
  logout?: Maybe<LogoutMutation>;
  refreshToken?: Maybe<RefreshToken>;
  updateActivity?: Maybe<UpdateActivity>;
  updateItem?: Maybe<UpdateItem>;
};

export type MutationRootCompleteActivityArgs = {
  id: Scalars["UUID"]["input"];
  isResolved: Scalars["Boolean"]["input"];
};

export type MutationRootCreateActivityArgs = {
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  items?: InputMaybe<Array<ItemInput>>;
  name: Scalars["String"]["input"];
};

export type MutationRootCreateItemArgs = {
  activityId: Scalars["UUID"]["input"];
  isResolved?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
};

export type MutationRootDeleteActivityArgs = {
  id: Scalars["UUID"]["input"];
};

export type MutationRootDeleteItemArgs = {
  id: Scalars["UUID"]["input"];
};

export type MutationRootLoginArgs = {
  password: Scalars["String"]["input"];
  username: Scalars["String"]["input"];
};

export type MutationRootLoginWithGoogleArgs = {
  code?: InputMaybe<Scalars["String"]["input"]>;
  credential?: InputMaybe<Scalars["String"]["input"]>;
  demo?: InputMaybe<Scalars["Boolean"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  redirectUri?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationRootLogoutArgs = {
  refresh?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationRootUpdateActivityArgs = {
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  id: Scalars["UUID"]["input"];
  name: Scalars["String"]["input"];
};

export type MutationRootUpdateItemArgs = {
  activityId: Scalars["UUID"]["input"];
  id: Scalars["UUID"]["input"];
  isResolved: Scalars["Boolean"]["input"];
  name: Scalars["String"]["input"];
};

export type QueryRoot = {
  __typename?: "QueryRoot";
  activities: Array<Maybe<ActivityType>>;
  googleClientId: Scalars["String"]["output"];
  items: Array<Maybe<ItemType>>;
  me?: Maybe<UserType>;
};

export type QueryRootItemsArgs = {
  isResolved?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type RefreshToken = {
  __typename?: "RefreshToken";
  access?: Maybe<Scalars["String"]["output"]>;
  errors: Array<Maybe<Scalars["String"]["output"]>>;
  refresh?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
};

export type UpdateActivity = {
  __typename?: "UpdateActivity";
  activity?: Maybe<ActivityType>;
  errors: Array<Maybe<Scalars["String"]["output"]>>;
};

export type UpdateItem = {
  __typename?: "UpdateItem";
  errors: Array<Maybe<Scalars["String"]["output"]>>;
  item?: Maybe<ItemType>;
};

export type UserType = {
  __typename?: "UserType";
  email: Scalars["String"]["output"];
  firstName: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  /** Designates whether the user can log into this admin site. */
  isStaff: Scalars["Boolean"]["output"];
  lastName: Scalars["String"]["output"];
  /** Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only. */
  username: Scalars["String"]["output"];
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  me: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
  } | null;
};

export type AuthenticateUserMutationVariables = Exact<{
  username: string;
  password: string;
}>;

export type AuthenticateUserMutation = {
  login: {
    success: boolean;
    errors: Array<string | null>;
    access: string | null;
    refresh: string | null;
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      isStaff: boolean;
    } | null;
  } | null;
};

export type EndSessionMutationVariables = Exact<{ [key: string]: never }>;

export type EndSessionMutation = {
  logout: { success: boolean; errors: Array<string | null> } | null;
};

export type RefreshSessionMutationVariables = Exact<{ [key: string]: never }>;

export type RefreshSessionMutation = {
  refreshToken: {
    success: boolean;
    errors: Array<string | null>;
    access: string | null;
    refresh: string | null;
  } | null;
};

export type GoogleConfigQueryVariables = Exact<{ [key: string]: never }>;

export type GoogleConfigQuery = { googleClientId: string };

export type AuthenticateGoogleMutationVariables = Exact<{
  credential?: string | null | undefined;
  code?: string | null | undefined;
  redirectUri?: string | null | undefined;
  demo?: boolean | null | undefined;
  email?: string | null | undefined;
  name?: string | null | undefined;
}>;

export type AuthenticateGoogleMutation = {
  loginWithGoogle: {
    success: boolean;
    errors: Array<string | null>;
    access: string | null;
    refresh: string | null;
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      isStaff: boolean;
    } | null;
  } | null;
};

export type UserFieldsFragment = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isStaff: boolean;
};

export type TodoItemsQueryVariables = Exact<{
  isResolved?: boolean | null | undefined;
}>;

export type TodoItemsQuery = {
  items: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    isResolved: boolean;
    activity: { id: string; name: string };
    createdBy: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      isStaff: boolean;
    };
  } | null>;
};

export type TodoActivitiesQueryVariables = Exact<{ [key: string]: never }>;

export type TodoActivitiesQuery = {
  activities: Array<{
    id: string;
    name: string;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    isResolved: boolean;
    createdBy: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      isStaff: boolean;
    };
    items: Array<{
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      isResolved: boolean;
      activity: { id: string; name: string };
      createdBy: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isStaff: boolean;
      };
    }>;
  } | null>;
};

export type CreateTodoActivityMutationVariables = Exact<{
  name: string;
  dueDate?: string | null | undefined;
  items?: Array<ItemInput> | ItemInput | null | undefined;
}>;

export type CreateTodoActivityMutation = {
  createActivity: {
    errors: Array<string | null>;
    activity: {
      id: string;
      name: string;
      dueDate: string | null;
      createdAt: string;
      updatedAt: string;
      isResolved: boolean;
      createdBy: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isStaff: boolean;
      };
      items: Array<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        isResolved: boolean;
        activity: { id: string; name: string };
        createdBy: {
          id: string;
          username: string;
          email: string;
          firstName: string;
          lastName: string;
          isStaff: boolean;
        };
      }>;
    } | null;
  } | null;
};

export type UpdateTodoActivityMutationVariables = Exact<{
  id: string;
  name: string;
  dueDate?: string | null | undefined;
}>;

export type UpdateTodoActivityMutation = {
  updateActivity: {
    errors: Array<string | null>;
    activity: {
      id: string;
      name: string;
      dueDate: string | null;
      createdAt: string;
      updatedAt: string;
      isResolved: boolean;
      createdBy: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isStaff: boolean;
      };
      items: Array<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        isResolved: boolean;
        activity: { id: string; name: string };
        createdBy: {
          id: string;
          username: string;
          email: string;
          firstName: string;
          lastName: string;
          isStaff: boolean;
        };
      }>;
    } | null;
  } | null;
};

export type DeleteTodoActivityMutationVariables = Exact<{
  id: string;
}>;

export type DeleteTodoActivityMutation = {
  deleteActivity: { success: boolean; errors: Array<string | null> } | null;
};

export type CompleteTodoActivityMutationVariables = Exact<{
  id: string;
  isResolved: boolean;
}>;

export type CompleteTodoActivityMutation = {
  completeActivity: {
    errors: Array<string | null>;
    activity: {
      id: string;
      name: string;
      dueDate: string | null;
      createdAt: string;
      updatedAt: string;
      isResolved: boolean;
      createdBy: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isStaff: boolean;
      };
      items: Array<{
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
        isResolved: boolean;
        activity: { id: string; name: string };
        createdBy: {
          id: string;
          username: string;
          email: string;
          firstName: string;
          lastName: string;
          isStaff: boolean;
        };
      }>;
    } | null;
  } | null;
};

export type CreateTodoItemMutationVariables = Exact<{
  name: string;
  activityId: string;
  isResolved?: boolean | null | undefined;
}>;

export type CreateTodoItemMutation = {
  createItem: {
    errors: Array<string | null>;
    item: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      isResolved: boolean;
      activity: { id: string; name: string };
      createdBy: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isStaff: boolean;
      };
    } | null;
  } | null;
};

export type UpdateTodoItemMutationVariables = Exact<{
  id: string;
  name: string;
  activityId: string;
  isResolved: boolean;
}>;

export type UpdateTodoItemMutation = {
  updateItem: {
    errors: Array<string | null>;
    item: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      isResolved: boolean;
      activity: { id: string; name: string };
      createdBy: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        isStaff: boolean;
      };
    } | null;
  } | null;
};

export type DeleteTodoItemMutationVariables = Exact<{
  id: string;
}>;

export type DeleteTodoItemMutation = {
  deleteItem: { success: boolean; errors: Array<string | null> } | null;
};

export type TodoItemFieldsFragment = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  activity: { id: string; name: string };
  createdBy: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
  };
};

export type TodoActivityWithItemsFieldsFragment = {
  id: string;
  name: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  items: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    isResolved: boolean;
    activity: { id: string; name: string };
    createdBy: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      isStaff: boolean;
    };
  }>;
};

export const UserFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const TodoItemFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TodoItemFieldsFragment, unknown>;
export const TodoActivityWithItemsFieldsFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoActivityWithItemsFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ActivityType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "dueDate" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "TodoItemFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TodoActivityWithItemsFieldsFragment, unknown>;
export const CurrentUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CurrentUser" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const AuthenticateUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AuthenticateUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "username" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "password" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "login" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "username" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "username" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "password" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "password" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
                { kind: "Field", name: { kind: "Name", value: "access" } },
                { kind: "Field", name: { kind: "Name", value: "refresh" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "UserFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AuthenticateUserMutation,
  AuthenticateUserMutationVariables
>;
export const EndSessionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "EndSession" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "logout" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EndSessionMutation, EndSessionMutationVariables>;
export const RefreshSessionDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "RefreshSession" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "refreshToken" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
                { kind: "Field", name: { kind: "Name", value: "access" } },
                { kind: "Field", name: { kind: "Name", value: "refresh" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RefreshSessionMutation,
  RefreshSessionMutationVariables
>;
export const GoogleConfigDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GoogleConfig" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "googleClientId" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GoogleConfigQuery, GoogleConfigQueryVariables>;
export const AuthenticateGoogleDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AuthenticateGoogle" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "credential" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "code" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "redirectUri" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "demo" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "email" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "loginWithGoogle" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "credential" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "credential" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "code" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "code" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "redirectUri" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "redirectUri" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "demo" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "demo" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "email" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "email" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "name" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
                { kind: "Field", name: { kind: "Name", value: "access" } },
                { kind: "Field", name: { kind: "Name", value: "refresh" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "UserFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AuthenticateGoogleMutation,
  AuthenticateGoogleMutationVariables
>;
export const TodoItemsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "TodoItems" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "isResolved" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "isResolved" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "isResolved" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "TodoItemFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TodoItemsQuery, TodoItemsQueryVariables>;
export const TodoActivitiesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "TodoActivities" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "activities" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "TodoActivityWithItemsFields" },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "createdBy" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "UserFields" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoActivityWithItemsFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ActivityType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "dueDate" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "TodoItemFields" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TodoActivitiesQuery, TodoActivitiesQueryVariables>;
export const CreateTodoActivityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateTodoActivity" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "dueDate" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "DateTime" },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "items" },
          },
          type: {
            kind: "ListType",
            type: {
              kind: "NonNullType",
              type: {
                kind: "NamedType",
                name: { kind: "Name", value: "ItemInput" },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createActivity" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "name" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "dueDate" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "dueDate" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "items" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "items" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "errors" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activity" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "TodoActivityWithItemsFields",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "UserFields" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoActivityWithItemsFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ActivityType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "dueDate" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "TodoItemFields" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateTodoActivityMutation,
  CreateTodoActivityMutationVariables
>;
export const UpdateTodoActivityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateTodoActivity" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UUID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "dueDate" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "DateTime" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateActivity" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "name" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "dueDate" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "dueDate" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activity" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "TodoActivityWithItemsFields",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "UserFields" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoActivityWithItemsFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ActivityType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "dueDate" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "TodoItemFields" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateTodoActivityMutation,
  UpdateTodoActivityMutationVariables
>;
export const DeleteTodoActivityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteTodoActivity" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UUID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteActivity" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteTodoActivityMutation,
  DeleteTodoActivityMutationVariables
>;
export const CompleteTodoActivityDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CompleteTodoActivity" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UUID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "isResolved" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "completeActivity" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "isResolved" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "isResolved" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "activity" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "TodoActivityWithItemsFields",
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createdBy" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "UserFields" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoActivityWithItemsFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ActivityType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "dueDate" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "items" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "TodoItemFields" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CompleteTodoActivityMutation,
  CompleteTodoActivityMutationVariables
>;
export const CreateTodoItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateTodoItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "activityId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UUID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "isResolved" },
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "name" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "activityId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "activityId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "isResolved" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "isResolved" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "TodoItemFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateTodoItemMutation,
  CreateTodoItemMutationVariables
>;
export const UpdateTodoItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "UpdateTodoItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UUID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "activityId" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UUID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "isResolved" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "name" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "name" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "activityId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "activityId" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "isResolved" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "isResolved" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "item" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "TodoItemFields" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "UserFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "UserType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "username" } },
          { kind: "Field", name: { kind: "Name", value: "email" } },
          { kind: "Field", name: { kind: "Name", value: "firstName" } },
          { kind: "Field", name: { kind: "Name", value: "lastName" } },
          { kind: "Field", name: { kind: "Name", value: "isStaff" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "TodoItemFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "ItemType" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "createdAt" } },
          { kind: "Field", name: { kind: "Name", value: "updatedAt" } },
          { kind: "Field", name: { kind: "Name", value: "isResolved" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "activity" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "createdBy" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "UserFields" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateTodoItemMutation,
  UpdateTodoItemMutationVariables
>;
export const DeleteTodoItemDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "DeleteTodoItem" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UUID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deleteItem" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "id" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "errors" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteTodoItemMutation,
  DeleteTodoItemMutationVariables
>;
