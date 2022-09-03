<template>
	<div class="card">
		<div class="top-border"></div>
		<div class="exception-content">
			<h1>Page Not Found</h1>
			<p>Requested resource is not available.</p>
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