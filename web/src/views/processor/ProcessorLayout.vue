<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Beekeper</v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item to="/profile">
            <v-list-item-title>내 정보</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-title>로그아웃</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item to="/processor" prepend-icon="mdi-view-dashboard">
          <v-list-item-title>대시보드</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/processor/reservations" prepend-icon="mdi-calendar">
          <v-list-item-title>예약 관리</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/processor/contracts" prepend-icon="mdi-file-document">
          <v-list-item-title>계약 관리</v-list-item-title>
        </v-list-item>
        
        <v-list-group value="resource">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cog">
              <v-list-item-title>자원 관리</v-list-item-title>
            </v-list-item>
          </template>
          
          <v-list-item to="/processor/facilities" prepend-icon="mdi-factory">
            <v-list-item-title>시설 관리</v-list-item-title>
          </v-list-item>
          
          <v-list-item to="/processor/users" prepend-icon="mdi-account-group">
            <v-list-item-title>사용자 관리</v-list-item-title>
          </v-list-item>
        </v-list-group>
        
        <v-list-group value="support">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-help-circle">
              <v-list-item-title>고객센터</v-list-item-title>
            </v-list-item>
          </template>
          
          <v-list-item to="/notices" prepend-icon="mdi-bullhorn">
            <v-list-item-title>공지사항</v-list-item-title>
          </v-list-item>
          
          <v-list-item to="/inquiries" prepend-icon="mdi-help-circle">
            <v-list-item-title>1:1 문의</v-list-item-title>
          </v-list-item>
        </v-list-group>
        
        <v-list-item to="/processor/profile" prepend-icon="mdi-office-building">
          <v-list-item-title>회사 정보</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const drawer = ref(true)
const router = useRouter()
const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script> 
