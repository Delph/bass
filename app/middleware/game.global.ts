import { createError, defineNuxtRouteMiddleware } from '#app';

import { games } from '~/composables/useGame';

export default defineNuxtRouteMiddleware((to) => {
  const param = to.params.slug;
  const slug = Array.isArray(param) ? param[0] : param;

  if (slug !== undefined && !games.some((game) => game.slug === slug))
    throw createError({ statusCode: 404, statusMessage: 'Game not found' });
});
