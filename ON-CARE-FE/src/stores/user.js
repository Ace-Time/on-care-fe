// stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue' 

export const useUserStore = defineStore(
  'user',
  () => {

    // ----- 외부 노출: 
    const name          = ref('');
    const userId        = ref(0);
    const email         = ref('');
    const roles         = ref([]);
    const profile       = ref('');
    const token         = ref('');
    const isLoggedIn    = ref(false); 
    const nickname      = ref('');
    const weight        = ref(0.0);
    const height        = ref(0.0);
    const bodyMetric    = ref(0);
    const birth         = ref('');
    const gender        = ref('');
    const phone         = ref('');
    
    // ----- Actions -----
    function logIn(
      {
        userName,
        userEmail,
        profilePath,
        authorities,
        userId: uid,
        nickname: nick,
        weight: in_weight,
        height: in_height,
        bodyMetric: body_metric,
        gender: gen,
        birth: bir,
        phone: ph,
      }
    ) {
      // console.log('asd',in_weight)
      name.value       = userName
      email.value      = userEmail
      profile.value    = profilePath
      roles.value      = authorities
      userId.value     = uid
      nickname.value   = nick
      isLoggedIn.value = true
      weight.value     = in_weight
      height.value     = in_height
      bodyMetric.value = body_metric
      birth.value      = bir
      gender.value     = gen === 'M' ? '남자' : '여자'
      phone.value      = ph
    }

    function logOut() {
      name.value       = ''
      email.value      = ''
      profile.value    = ''
      roles.value      = []
      token.value      = ''
      userId.value     = 0
      nickname.value   = ''
      isLoggedIn.value = false
      weight.value     = 0
      height.value     = 0
      bodyMetric.value = 0
      birth.value      = ''
      gender.value     = ''
      phone.value      = ''
      sessionStorage.removeItem('aiDietPlan')
      sessionStorage.removeItem('aiExercisePlan')
    }

    function setToken(jwtToken) {
      token.value = jwtToken 
    }

    function changeProfile(newProfile) {
      profile.value = newProfile
    }

    // ✅ roles 배열에서 대표 역할 하나만 뽑아서 헤더에서 쓰기 좋게 만든 computed
    const mainRole = computed(() => {
      const r = roles.value && roles.value.length > 0 ? roles.value[0] : null
      if (!r) return null
      // 백엔드에서 'ROLE_MANAGER' 이런 식으로 온다면 접두사 제거
      if (typeof r === 'string' && r.startsWith('ROLE_')) {
        return r.replace('ROLE_', '')
      }
      return r
    })

    // ----- 반환 -----
    return {
      // state
      name,
      email,
      roles,
      profile,
      token,
      isLoggedIn,
      userId,
      nickname,
      weight,
      height,
      bodyMetric,
      gender,
      birth,
      phone,

      // ✅ 대표 역할 (MANAGER / SALES / MATERIAL / CAREGIVER 등)
      mainRole,

      // actions
      logIn,
      logOut,
      changeProfile,
      setToken,
    }
  },
  {
    persist: {
      enabled: true, //storage 저장유무
      storage: sessionStorage,
      paths: [
        'name',
        'email',
        'roles',
        'profile',
        'bodyMetric',
        'gender',
        'phone',
        'birth',
        'token',
        'isLoggedIn',
        'userId',
        'nickname',
        'weight',
        'height',
      ],
    },
  }
)