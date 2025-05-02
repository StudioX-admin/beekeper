<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card outlined>
            <v-card-title>
              폐기물 수거 요청 관리
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="openNewRequestDialog">
                <v-icon left>mdi-plus</v-icon>
                새 요청
              </v-btn>
            </v-card-title>