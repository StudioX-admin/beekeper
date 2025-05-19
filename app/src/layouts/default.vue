<script setup>
  import router from "@/router/index.js";

  console.log(router.currentRoute.value)
  const hasPath = (path)=>{
    return -1 < router.currentRoute.value.path.indexOf(path)
  }


  import { ref, onMounted, onUnmounted } from 'vue'
  const showHeader = ref(true)
  let lastScrollY = window.scrollY

  const handleScroll = () => {
    const currentY = window.scrollY

    if (currentY === 0) {
      showHeader.value = true // 맨 위에서는 무조건 보이게
    } else if (currentY < lastScrollY) {
      showHeader.value = true // 위로 스크롤할 때
    } else {
      showHeader.value = false // 아래로 스크롤할 때
    }

    lastScrollY = currentY
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })


  //side menu
  const showSideMenu = ref(false);
  const toggleSideMenu = () => {
    showSideMenu.value = !showSideMenu.value;
  }

  const subMenuOpen = ref(0)
  const toggleSubMenu = (menuIndex) => {
    subMenuOpen.value = subMenuOpen.value === menuIndex ? 0 : menuIndex
  }

</script>

<template>
  <header :class="{ visible: showHeader, hidden: !showHeader }">
    <div>
      <button @click="toggleSideMenu" class="menu_btn"><img src="../assets/images/icon_menu.png" alt=""></button>
      <img class="logo_img" src="../assets/images/main_logo.png" alt="">
      <RouterLink to="/news" class="news_btn"><img src="../assets/images/icon_bell.png" alt=""></RouterLink>
    </div>
  </header>


  <div class="side_menu_bg" :class="{'open': showSideMenu === true}"></div>
  <div class="side_menu" :class="{'open': showSideMenu === true}">
    <div class="title_wrap">
      <RouterLink to="/home" class="logo"><img src="../assets/images/main_logo.png" alt=""></RouterLink>
      <RouterLink to="/home" class="home_btn"><img src="../assets/images/icon_home.png" alt=""></RouterLink>
      <button @click="toggleSideMenu" class="close_btn"><img src="../assets/images/icon_close.png" alt=""></button>
    </div>

    <div class="my_menu">
      <div class="logo_image"><img src="../assets/images/symbol.png" alt=""></div>
      <div class="name">
        <RouterLink to="/profile/ProfileView">홍길동님 <img src="../assets/images/icon_right.png" alt=""></RouterLink>
        <span>(주)그린스퀘어</span>
      </div>
    </div>

    <div class="section_bar"></div>

    <nav>
      <ul>
        <li><RouterLink to="/transport/TransportList" class="main_menu">운행관리</RouterLink></li>
        <li>
          <div class="main_menu" @click="toggleSubMenu(1)" :class="{'open': subMenuOpen === 1}">고객센터 <img src="../assets/images/icon_down.png" alt=""></div>
          <div class="sub_menu" :class="{'open': subMenuOpen === 1}">
            <RouterLink to="/customer/notice/NoticeList">공지사항</RouterLink>
            <RouterLink to="/customer/inquiry/InquiryList">1:1 문의사항</RouterLink>
          </div>
        </li>
        <li><RouterLink to="/news" class="main_menu">알림</RouterLink></li>
        <li><RouterLink to="/setting" class="main_menu">설정</RouterLink></li>
      </ul>
    </nav>

    <div class="copyright_wrap">COPYRIGHT © 2025 Beekeper. ALL RIGHTS RESERVED</div>
  </div>


  <section>
    <router-view/>
  </section>
</template> 