import { defineStore } from 'pinia';
import axios from 'axios';
import { assetsApi } from '@/api/assets.api';
import type { Asset } from '@/types/asset';

type ValidationErrors = Record<string, string[]>;

export const useAssetStore = defineStore('asset', {
  state: () => ({
    assets: [] as Asset[],
    loading: false,
    errorMessage: null as string | null,
    errors: null as ValidationErrors | null,
  }),

  actions: {
    clearErrors() {
      this.errorMessage = null;
      this.errors = null;
    },
    async fetchAssets() {
      this.loading = true;
      const { data } = await assetsApi.getAll();
      this.assets = data;
      this.loading = false;
    },

    async createAsset(payload: Partial<Asset>) {
      this.clearErrors();
      try {
        const { data } = await assetsApi.create(payload);
        this.assets.push(data);
        return true;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const responseData = error.response?.data as
            | { message?: string; errors?: ValidationErrors }
            | undefined;
          this.errorMessage = responseData?.message ?? 'Validation failed';
          this.errors = responseData?.errors ?? null;
          return false;
        }
        this.errorMessage = 'Unknown error';
        return false;
      }
    },

    async deleteAsset(id: number) {
      await assetsApi.delete(id);
      this.assets = this.assets.filter(a => a.id !== id);
    },
    async updateAsset(id: number, payload: Partial<Asset>) {
      this.clearErrors();
      try {
        const { data } = await assetsApi.update(id, payload);
        const index = this.assets.findIndex(a => a.id === id);
        if (index !== -1) {
          const isAssetObject = typeof data === 'object' && data !== null;
          this.assets[index] = isAssetObject
            ? (data as Asset)
            : ({ ...this.assets[index], ...payload } as Asset);
        }
        return true;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const responseData = error.response?.data as
            | { message?: string; errors?: ValidationErrors }
            | undefined;
          this.errorMessage = responseData?.message ?? 'Validation failed';
          this.errors = responseData?.errors ?? null;
          return false;
        }
        this.errorMessage = 'Unknown error';
        return false;
      }
    },
  },
});
