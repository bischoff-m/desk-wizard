type App = {
  provide: (key: string, value: any) => void;
};

// export const register = (app: App) => {

// }

export const MeinPlugin = {
  install(app: App) {
    app.provide("mein-plugin", "Hello from MeinPlugin");
  },
};
