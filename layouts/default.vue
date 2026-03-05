<template>
  <div class="app-container">
    <header class="header">
      <h1 class="logo">
        <NuxtLink to="/">Super Memory</NuxtLink>
      </h1>
      <p class="tagline">Develop a Super Power Memory</p>
      <nav class="nav">
        <NuxtLink to="/train">记忆训练</NuxtLink>
        <NuxtLink to="/memory-methods">记忆方法</NuxtLink>
        <NuxtLink to="/chapters">课程章节</NuxtLink>
      </nav>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <footer class="footer">
      <p>Super Memory - 超级记忆力训练</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f5f5;
  color: #333;
}

* {
  box-sizing: border-box;
}

a {
  color: #00dc82;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #00dc82 0%, #00b368 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.logo {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.logo a {
  color: white;
}

.logo a:hover {
  text-decoration: none;
}

.tagline {
  opacity: 0.9;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.nav a {
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.nav a:hover {
  background: rgba(255, 255, 255, 0.2);
  text-decoration: none;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.footer {
  background: #333;
  color: #999;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
</style>
