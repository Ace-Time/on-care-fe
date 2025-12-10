<template>
    <div class="page-body">
      <section class="left-panel">
        <RecipientList
          :recipients="recipients"
          v-model:selected-id="selectedId"
        />
      </section>
  
      <section class="right-panel">
        <RecipientInformation :recipient="selectedRecipient" />
  
        <RecipientCategory
          v-if="selectedRecipient"
          :service-history="serviceHistory"
          :rental-items="rentalItems"
        />
      </section>
    </div>
  </template>
  
  <script setup>
    import { ref, computed } from 'vue'
    
    import RecipientList from '@/components/recipient/RecipientList.vue'
    import RecipientInformation from '@/components/recipient/RecipientInformation.vue'
    import RecipientCategory from '@/components/recipient/RecipientCategory.vue'
    
    import { recipientsMock } from '@/mock/recipientMock'
    import { serviceHistoryMock } from '@/mock/serviceHistoryMock'
    import { rentalItemsMock } from '@/mock/rentalItemsMock'
    
    const recipients = ref(recipientsMock)
    const serviceHistory = ref(serviceHistoryMock)
    const rentalItems = ref(rentalItemsMock)
    
    const selectedId = ref(recipients.value[0]?.id || null)
    
    const selectedRecipient = computed(
      () => recipients.value.find((r) => r.id === selectedId.value) || null,
    )
    </script>
  
  <style scoped>
  .page-body {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 16px;
    margin-top: 12px;
  }
  
  .left-panel,
  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  @media (max-width: 960px) {
    .page-body {
      grid-template-columns: 1fr;
    }
  }
  </style>