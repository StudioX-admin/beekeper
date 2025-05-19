<script setup>
  import {ref} from "vue";
  import UpdateModal1 from "../pages/intro/modal/UpdateModal1.vue"
  import UpdateModal2 from "../pages/intro/modal/UpdateModal2.vue"
  import NoticeModal from "../pages/intro/modal/NoticeModal.vue"
  import AccessModal from "../pages/intro/modal/AccessModal.vue"

  import TermsModal from "../pages/join/modal/TermsModal.vue"

  import CancelModal from "../pages/home/modal/CancelModal.vue"
  import DeliveryInfoModal from "../pages/home/modal/DeliveryInfoModal.vue"
  import DeliveryModal1 from "../pages/home/modal/DeliveryModal1.vue"
  import DeliveryModal2 from "../pages/home/modal/DeliveryModal2.vue"

  const showUpdateModal1 = ref(false);
  const openUpdateModal1 = () => { showUpdateModal1.value = true; };
  const closeUpdateModal1 = () => { showUpdateModal1.value = false; }

  const showUpdateModal2 = ref(false);
  const openUpdateModal2 = () => { showUpdateModal2.value = true; }
  const closeUpdateModal2 = () => { showUpdateModal2.value = false; }

  const showNoticeModal = ref(false);
  const openNoticeModal = () => { showNoticeModal.value = true; };
  const closeNoticeModal = () => { showNoticeModal.value = false; }

  const showAccessModal = ref(false);
  const openAccessModal = () => { showAccessModal.value = true; }
  const closeAccessModal = () => { showAccessModal.value = false; }

  const showTermsModal = ref(false);
  const openTermsModal = () => { showTermsModal.value = true };
  const closeTermsModal = () => { showTermsModal.value = false };

  const showCancelModal = ref(false);
  const openCancelModal = () => { showCancelModal.value = true; }
  const closeCancelModal = () => { showCancelModal.value = false; }

  const showDeliveryInfoModal = ref(false);
  const openDeliveryInfoModal = () => { showDeliveryInfoModal.value = true; }
  const closeDeliveryInfoModal = () => { showDeliveryInfoModal.value = false; }

  const showDeliveryModal1 = ref(false);
  const openDeliveryModal1 = () => { showDeliveryModal1.value = true; }
  const closeDeliveryModal1 = () => { showDeliveryModal1.value = false; }

  const showDeliveryModal2 = ref(false);
  const openDeliveryModal2 = () => { showDeliveryModal2.value = true; }
  const closeDeliveryModal2 = () => { showDeliveryModal2.value = false; }
</script>

<template>
  <div class="index_page">
    <div>
      <div class="title_wrap">
        <div class="blue_color">완료</div>
      </div>

      <table>
        <tr>
          <th>분류</th>
          <th>페이지 이름</th>
          <th>링크</th>
          <th>추가 확인 사항</th>
          <th>메모</th>
        </tr>


        <tr>
          <td>인트로</td>
          <td>인트로</td>
          <td><RouterLink to="/intro" class="blue_color">인트로</RouterLink></td>
          <td>
            <button @click="openAccessModal">앱 접근 권한 안내</button>
            <button @click="openUpdateModal1">최신 버전 업데이트(지금 안함)</button>
            <button @click="openUpdateModal2">최신 버전 업데이트(업데이트)</button>
            <button @click="openNoticeModal">서비스 일시 정지 공지</button>

            <div class="modal_set bg" :class="{'on' : showUpdateModal1 === true}">
              <UpdateModal1 @close="closeUpdateModal1" />
            </div>
            <div class="modal_set bg" :class="{'on' : showUpdateModal2 === true}">
              <UpdateModal2 @close="closeUpdateModal2" />
            </div>
            <div class="modal_set bg" :class="{'on' : showNoticeModal === true} ">
              <NoticeModal @close="closeNoticeModal" />
            </div>
            <div class="modal_set bg" :class="{'on' : showAccessModal === true} ">
              <AccessModal @close="closeAccessModal" />
            </div>
          </td>
          <td></td>
        </tr>

        <tr>
          <td rowspan="4">로그인/회원가입</td>
          <td>로그인</td>
          <td><RouterLink to="/login" class="blue_color">로그인</RouterLink></td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td>회원가입</td>
          <td><RouterLink to="/join/JoinConsent" class="blue_color">약관동의</RouterLink></td>
          <td>
            <button @click="openTermsModal">약관 보기 모달</button>
            <div class="modal_set" :class="{'on' : showTermsModal === true}">
              <TermsModal @close="closeTermsModal" />
            </div>
          </td>
          <td></td>
        </tr>
        <tr>
          <td>회원가입</td>
          <td><RouterLink to="/join/JoinPersonalInfo" class="blue_color"> 정보입력</RouterLink></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>회원가입</td>
          <td><RouterLink to="/join/JoinMessage" class="blue_color">가입 완료</RouterLink></td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td>메인</td>
          <td>홈</td>
          <td><RouterLink to="/home" CLASS="blue_color">홈</RouterLink></td>
          <td>
            배출업체 정보 바텀시트<br/>
            지도앱에서 길찾기 모달
            <button @click="openCancelModal">하차 하시겠습니까?</button>
            <button @click="openDeliveryInfoModal">작업 상태 모달</button>
            <button @click="openDeliveryModal1">돌발 사유 입력</button>
<!--            <button @click="openDeliveryModal2">예상 소요시간 입력</button>-->

            <div class="modal_set bg" :class="{'on' : showCancelModal === true}">
              <CancelModal @close="closeCancelModal" />
            </div>

            <div class="modal_set bg" :class="{'on' : showDeliveryInfoModal === true}">
              <DeliveryInfoModal @close="closeDeliveryInfoModal" />
            </div>

            <div class="modal_set bg" :class="{'on' : showDeliveryModal1 === true}">
              <DeliveryModal1 @close="closeDeliveryModal1" />
            </div>

            <div class="modal_set bg" :class="{'on' : showDeliveryModal2 === true}">
              <DeliveryModal2 @close="closeDeliveryModal2" />
            </div>
          </td>
          <td>
          </td>
        </tr>

        <tr>
          <td rowspan="2">운행관리</td>
          <td>목록</td>
          <td><RouterLink to="/transport/TransportList" class="blue_color">운행관리 목록</RouterLink></td>
          <td>
            달력 일/월/연
          </td>
          <td></td>
        </tr>
        <tr>
          <td>상세</td>
          <td><RouterLink to="/transport/TransportView" class="blue_color">운행관리 상세</RouterLink></td>
          <td>
            배출업체 정보 바텀시트<br/>
            지도앱에서 길찾기 모달<br/>
          </td>
          <td></td>
        </tr>

        <tr>
          <td>프로필</td>
          <td>프로필</td>
          <td><RouterLink to="/profile/ProfileView" class="blue_color">프로필 보기</RouterLink></td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td>알림</td>
          <td>알림</td>
          <td><RouterLink to="/news" class="blue_color">알림 목록</RouterLink></td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td rowspan="5">고객센터</td>
          <td rowspan="2">공지사항</td>
          <td><RouterLink to="/customer/notice/NoticeList" class="blue_color">공지사항 목록</RouterLink></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td><RouterLink to="/customer/notice/NoticeView" class="blue_color">공지사항 상세</RouterLink></td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td rowspan="3">1:1문의</td>
          <td><RouterLink to="/customer/inquiry/InquiryList" class="blue_color">문의 목록</RouterLink></td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td><RouterLink to="/customer/inquiry/InquiryView" class="blue_color">문의 상세</RouterLink></td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td><RouterLink to="/customer/inquiry/InquiryAdd" class="blue_color">문의 등록</RouterLink></td>
          <td></td>
          <td></td>
        </tr>

        <tr>
          <td>설정</td>
          <td>앱 설정</td>
          <td><RouterLink to="/setting" class="blue_color">앱 설정</RouterLink></td>
          <td>
            로그아웃 하시겠습니까?<br/>
            회원 탈퇴
          </td>
          <td></td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.index_page > div { width: 100%; max-width: 1200px; margin: 0 auto; padding: 50px 0; }

.index_page .title_wrap { margin: 10px 0; display: flex; justify-content: flex-end; gap: 20px; }
.index_page .title_wrap > div { display: flex; align-items: center; }
.index_page .title_wrap > div::before { content: ''; width: 12px; height: 12px; margin-right: 6px; border-radius: 50%; }
.index_page .title_wrap > div.blue_color::before { background-color: #02b1f5; }
.index_page .title_wrap > div.gray_color::before { background-color: #abaaaa; }

.index_page table { width: 100%; border-top: 4px solid #161C24; }
</style> 