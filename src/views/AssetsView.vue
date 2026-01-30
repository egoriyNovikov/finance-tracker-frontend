<template>
  <div class="page">
    <header class="hero">
      <div>
        <h1>Assets</h1>
        <p class="subtitle">Активы</p>
      </div>
      <div class="chip">
        <span class="chip-label">Всего активов</span>
        <span class="chip-value">{{ assetStore.assets.length }}</span>
      </div>
    </header>

    <section class="panel">
      <h2>Добавить актив</h2>
      <div v-if="assetStore.errorMessage" class="form-error">
        {{ assetStore.errorMessage }}
      </div>
      <form class="form" @submit.prevent="handleCreate">
        <div class="field">
          <input v-model.trim="form.name" type="text" placeholder="Название" required />
          <div v-if="fieldError('name')" class="field-error">{{ fieldError('name') }}</div>
        </div>
        <div class="field">
          <select v-model="form.type">
            <option value="cash">Cash</option>
            <option value="crypto">Crypto</option>
            <option value="stock">Stock</option>
            <option value="deposit">Deposit</option>
          </select>
          <div v-if="fieldError('type')" class="field-error">{{ fieldError('type') }}</div>
        </div>
        <div class="field">
          <input v-model.trim="form.currency" type="text" placeholder="Валюта (USD, BTC)" required />
          <div v-if="fieldError('currency')" class="field-error">{{ fieldError('currency') }}</div>
        </div>
        <div class="field">
          <input v-model.number="form.amount" type="number" step="0.01" min="0" placeholder="Сумма" required />
          <div v-if="fieldError('amount')" class="field-error">{{ fieldError('amount') }}</div>
        </div>
        <button class="primary" type="submit">Добавить</button>
      </form>
    </section>

    <section class="list">
      <div class="list-header">
        <h2>Список активов</h2>
        <span v-if="assetStore.loading" class="muted">Загрузка...</span>
      </div>

      <div v-if="!assetStore.loading && assetStore.assets.length === 0" class="empty">
        Пока активов нет — добавьте первый.
      </div>

      <div class="cards">
        <article v-for="asset in assetStore.assets" :key="asset.id" class="card">
          <div class="card-top">
            <div>
              <div class="title">{{ asset.name }}</div>
              <div class="meta">{{ asset.type }} · {{ asset.currency }}</div>
            </div>
            <button class="ghost danger" @click="assetStore.deleteAsset(asset.id)">Удалить</button>
          </div>
          <div class="amount">{{ asset.amount }}</div>
          <div class="card-actions">
            <button class="ghost" @click="openEdit(asset)">Редактировать</button>
          </div>
        </article>
      </div>
    </section>

    <div v-if="isEditOpen" class="modal-backdrop" @click.self="closeEdit">
      <div class="modal">
        <div class="modal-header">
          <h3>Обновить актив</h3>
          <button class="ghost" @click="closeEdit">×</button>
        </div>
        <div v-if="assetStore.errorMessage" class="form-error">
          {{ assetStore.errorMessage }}
        </div>
        <form class="modal-form" @submit.prevent="handleUpdate">
          <div class="field">
            <input v-model.trim="editForm.name" type="text" placeholder="Название" required />
            <div v-if="fieldError('name')" class="field-error">{{ fieldError('name') }}</div>
          </div>
          <div class="field">
            <select v-model="editForm.type">
              <option value="cash">Cash</option>
              <option value="crypto">Crypto</option>
              <option value="stock">Stock</option>
              <option value="deposit">Deposit</option>
            </select>
            <div v-if="fieldError('type')" class="field-error">{{ fieldError('type') }}</div>
          </div>
          <div class="field">
            <input v-model.trim="editForm.currency" type="text" placeholder="Валюта" required />
            <div v-if="fieldError('currency')" class="field-error">{{ fieldError('currency') }}</div>
          </div>
          <div class="field">
            <input v-model.number="editForm.amount" type="number" step="0.01" min="0" placeholder="Сумма" required />
            <div v-if="fieldError('amount')" class="field-error">{{ fieldError('amount') }}</div>
          </div>
          <div class="modal-actions">
            <button class="ghost" type="button" @click="closeEdit">Отмена</button>
            <button class="primary" type="submit" @click="handleUpdate">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useAssetStore } from '@/stores/asset.store';
import type { Asset } from '@/types/asset';

const assetStore = useAssetStore();
const form = reactive({
  name: '',
  type: 'cash' as Asset['type'],
  currency: 'USD',
  amount: 0,
});

const isEditOpen = ref(false);
const editingId = ref<number | null>(null);
const editForm = reactive({
  name: '',
  type: 'cash' as Asset['type'],
  currency: 'USD',
  amount: 0,
});

const resetForm = () => {
  form.name = '';
  form.type = 'cash';
  form.currency = 'USD';
  form.amount = 0;
};

const handleCreate = async () => {
  const success = await assetStore.createAsset({
    name: form.name,
    type: form.type,
    currency: form.currency,
    amount: Number(form.amount),
  });
  if (success) {
    resetForm();
  }
};

const openEdit = (asset: Asset) => {
  assetStore.clearErrors();
  editingId.value = asset.id;
  editForm.name = asset.name;
  editForm.type = asset.type;
  editForm.currency = asset.currency;
  editForm.amount = asset.amount;
  isEditOpen.value = true;
};

const closeEdit = () => {
  isEditOpen.value = false;
  editingId.value = null;
  assetStore.clearErrors();
};

const handleUpdate = async () => {
  if (editingId.value === null) {
    return;
  }
  const success = await assetStore.updateAsset(editingId.value, {
    name: editForm.name,
    type: editForm.type,
    currency: editForm.currency,
    amount: Number(editForm.amount),
  });
  if (success) {
    closeEdit();
  }
};

const fieldError = (field: string) => assetStore.errors?.[field]?.[0];



onMounted(() => {
  assetStore.fetchAssets();
});
</script>

<style scoped>
.page {
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 20px 48px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(120deg, #eff6ff, #f8fafc);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

h1 {
  margin: 0 0 6px;
  font-size: 28px;
}

.subtitle {
  margin: 0;
  color: #64748b;
}

.chip {
  display: grid;
  gap: 6px;
  padding: 12px 16px;
  background: #0f172a;
  color: #fff;
  border-radius: 12px;
  min-width: 140px;
  text-align: right;
}

.chip-label {
  font-size: 12px;
  opacity: 0.7;
}

.chip-value {
  font-size: 22px;
  font-weight: 600;
}

.panel {
  margin-top: 18px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
}

.form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  gap: 12px;
  align-items: center;
}

.form input,
.form select,
.modal-form input,
.modal-form select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.field {
  display: grid;
  gap: 6px;
}

.form-error {
  margin: 8px 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff1f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.field-error {
  font-size: 12px;
  color: #b91c1c;
}

.primary {
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.list {
  margin-top: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.muted {
  color: #94a3b8;
}

.empty {
  padding: 18px;
  border-radius: 12px;
  border: 1px dashed #cbd5f5;
  color: #64748b;
  background: #f8fafc;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 12px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
}

.title {
  font-weight: 600;
  font-size: 16px;
}

.meta {
  font-size: 12px;
  color: #64748b;
  text-transform: capitalize;
}

.amount {
  font-size: 22px;
  font-weight: 700;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.ghost {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
}

.danger {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fff1f2;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal {
  width: min(520px, 100%);
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
  border: 1px solid #e2e8f0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.modal-form {
  display: grid;
  gap: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 860px) {
  .form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .form {
    grid-template-columns: 1fr;
  }
}
</style>