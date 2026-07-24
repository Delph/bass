import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import Rollbar from 'rollbar';

export default defineNuxtPlugin((app) => {
  const runtimeConfig = useRuntimeConfig();
  const token = String(runtimeConfig.public.rollbarAccessToken);

  const rollbar = new Rollbar({
    enabled: Boolean(token),
    accessToken: token,
    autoInstrument: {
      network: true,
      networkRequestBody: false,
      networkRequestHeaders: false,
      networkResponseBody: false,
      networkResponseHeaders: false,
      log: false,
      dom: false,
      navigation: false,
      connectivity: true,
      contentSecurityPolicy: true,
    },
    captureIp: false,
    captureUncaught: true,
    captureUnhandledRejections: true,
    includeItemsInTelemetry: false,
    maxTelemetryEvents: 20,
    scrubPaths: ['request.query_string'],
    scrubTelemetryInputs: true,
    transform(payload) {
      const request = payload.request as Record<string, unknown> | undefined;
      if (!request) return;

      delete request.query_string;
      if (typeof request.url !== 'string') return;

      try {
        const url = new URL(request.url);
        request.url = `${url.origin}${url.pathname}`;
      } catch {
        delete request.url;
      }
    },
    payload: {
      environment: import.meta.env.MODE,
      client: {
        javascript: {
          code_version: String(runtimeConfig.public.appVersion),
          source_map_enabled: true,
        },
      },
    },
  });

  app.hook('vue:error', (error, instance, info) => {
    rollbar.error(error as Error, {
      vueComponent: instance?.$options.name ?? 'Anonymous Component',
      info,
    });

    if (import.meta.dev) console.error(error);
  });

  return {
    provide: {
      rollbar,
    },
  };
});
