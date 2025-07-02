<template>
  <q-item 
    clickable 
    v-ripple 
    :to="route"
    :class="{ 'bg-primary text-white': $route.path === route }"
  >
    <q-item-section avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  }
})
</script>

<style lang="scss" scoped>
.q-item.bg-primary {
  border-radius: 0 25px 25px 0;
  margin-right: 8px;
}
</style>
