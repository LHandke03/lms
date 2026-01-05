<template>
	<div class="flex flex-col h-screen w-screen">
		<div class="w-full border-b bg-surface-menu-bar">
			<AppSidebar />
		</div>
		<div class="flex-1 flex flex-col h-full overflow-auto bg-surface-white">
			<slot />
		</div>
	</div>
</template>
<script setup>
import AppSidebar from './AppSidebar.vue'
</script>
