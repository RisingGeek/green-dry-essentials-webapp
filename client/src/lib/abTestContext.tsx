import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ABTestConfig, ABTestVariant } from '@shared/types';
import { apiRequest } from './queryClient';

interface ABTestContextType {
  config: ABTestConfig;
  trackImpression: (testName: string, variant: string) => void;
  trackConversion: (testName: string, variant: string) => void;
}

const defaultConfig: ABTestConfig = {
  productCardStyle: { name: 'productCardStyle', value: 'variant-a' },
  ctaStyle: { name: 'ctaStyle', value: 'rounded' }
};

const ABTestContext = createContext<ABTestContextType>({
  config: defaultConfig,
  trackImpression: () => {},
  trackConversion: () => {}
});

export const useABTest = () => useContext(ABTestContext);

export const ABTestProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ABTestConfig>(defaultConfig);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate a session ID for tracking if not exists
    const existingSessionId = localStorage.getItem('sessionId');
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const newSessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('sessionId', newSessionId);
      setSessionId(newSessionId);
    }

    // Try to fetch A/B test configuration from localStorage first
    const storedConfig = localStorage.getItem('abTestConfig');
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    } else {
      // Or initialize with random values and save them
      const initialConfig: ABTestConfig = {
        productCardStyle: {
          name: 'productCardStyle',
          value: Math.random() > 0.5 ? 'variant-a' : 'variant-b'
        },
        ctaStyle: {
          name: 'ctaStyle',
          value: Math.random() > 0.5 ? 'rounded' : 'square'
        }
      };
      setConfig(initialConfig);
      localStorage.setItem('abTestConfig', JSON.stringify(initialConfig));
    }
  }, []);

  // Apply A/B test styles to body
  useEffect(() => {
    if (config.productCardStyle.value) {
      document.body.classList.remove('product-cards-variant-a', 'product-cards-variant-b');
      document.body.classList.add(`product-cards-${config.productCardStyle.value}`);
    }
  }, [config.productCardStyle.value]);

  const trackImpression = async (testName: string, variant: string) => {
    try {
      await apiRequest('POST', '/api/ab-test/impression', { 
        testName, 
        variant, 
        sessionId 
      });
    } catch (error) {
      console.error('Failed to track impression:', error);
    }
  };

  const trackConversion = async (testName: string, variant: string) => {
    try {
      await apiRequest('POST', '/api/ab-test/conversion', { 
        testName, 
        variant, 
        sessionId 
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  };

  return (
    <ABTestContext.Provider value={{ config, trackImpression, trackConversion }}>
      {children}
    </ABTestContext.Provider>
  );
};
