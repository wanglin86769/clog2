<template>
	<div class="card">
		<div class="top-border"></div>
		<div class="exception-content">
			<h1>Access Denied</h1>
			<p>Insufficient user permission.</p>
			<Button label="Go to homepage" @click="goHomepage" />
		</div>
	</div>
</template>

<script>
	export default {
		methods: {
			goHomepage(){
				this.$router.push({path: '/'});
			}
		}
	}
</script>

<style scoped>

</style>