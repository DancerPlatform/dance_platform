import { useState } from 'react';
import { PortfolioSectionType } from './usePortfolioSort';

export type PortfolioData = any[];

interface ModalState {
  isOpen: boolean;
  sectionType: PortfolioSectionType | null;
  sectionTitle: string;
  data: PortfolioData;
}

interface UsePortfolioModalReturn {
  modalState: ModalState;
  openModal: (sectionType: PortfolioSectionType, sectionTitle: string, data: PortfolioData) => void;
  closeModal: () => void;
}

export function usePortfolioModal(): UsePortfolioModalReturn {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    sectionType: null,
    sectionTitle: '',
    data: [],
  });

  const openModal = (sectionType: PortfolioSectionType, sectionTitle: string, data: PortfolioData) => {
    setModalState({
      isOpen: true,
      sectionType,
      sectionTitle,
      data,
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      sectionType: null,
      sectionTitle: '',
      data: [],
    });
  };

  return { modalState, openModal, closeModal };
}
