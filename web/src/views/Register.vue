<script>
import AuthService from '@/services/auth';

export default {
  name: 'Register',
  data() {
    return {
      userData: {
        name: '',
        email: '',
        password: ''
      },
      confirmPassword: '',
      loading: false,
      error: null
    };
  },
  methods: {
    async register() {
      if (this.userData.password !== this.confirmPassword) {
        this.error = '비밀번호가 일치하지 않습니다.';
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        await AuthService.register(
          this.userData.name,
          this.userData.email,
          this.userData.password
        );
        
        this.$router.push('/login?registered=true');
      } catch (err) {
        console.error('회원가입 오류:', err);
        this.error = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
