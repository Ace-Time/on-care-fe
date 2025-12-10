<template>
    <div class="search-wrapper">
      <div class="search-label-area">
        <img src="@/assets/img/common/search.png" alt="search" class="search-icon" />
      </div>
  
      <div class="search-input-area">
        <input
          type="text"
          class="search-input"
          placeholder="수급자, 요양보호사, 서비스 타입 검색"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .search-wrapper {
    box-sizing: border-box;
    width: 49.3%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;        
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
    overflow: hidden; 
  }
  
  .search-label-area {
    display: flex;
    align-items: center;
  }
  
  .search-icon {
    width: 18px;
    height: 18px;
    opacity: 0.8;
  }
  
  .search-input-area {
    flex: 1;
    overflow: hidden;        
  }
  
  .search-input {
    width: 100%;             
    padding: 8px 12px;       
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
  }
  
  .search-input:focus {
    border-color: #00c950;
  }
  </style>