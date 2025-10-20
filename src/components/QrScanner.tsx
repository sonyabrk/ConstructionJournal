import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import './QrScanner.scss';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQrScanned: (projectId: number) => void;
}

const QrScannerModal: React.FC<QrScannerModalProps> = ({ 
  isOpen, 
  onClose, 
  onQrScanned 
}) => {
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const handleQrCode = useCallback(async (qrData: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Отправляем timestamp на /qr/generate/ для верификации
      const response = await fetch('/api/qr/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ timestamp: qrData })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Предполагаем, что ответ содержит project_id если QR валиден
      if (result.project_id) {
        onQrScanned(result.project_id);
        onClose();
      } else {
        setError('QR-код недействителен или просрочен');
      }
    } catch (err: unknown) {
      console.error('QR processing error:', err);
      let errorMessage = 'Ошибка при проверке QR-кода';
      
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          errorMessage = 'Ошибка авторизации. Пожалуйста, войдите снова.';
        } else if (err.message.includes('400')) {
          errorMessage = 'QR-код недействителен или просрочен';
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onQrScanned, onClose]);

  const stopCameraScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
      scannerRef.current = null;
    }
  }, []);

  const startCameraScanner = useCallback(() => {
    if (!scannerContainerRef.current) return;

    stopCameraScanner();

    scannerRef.current = new Html5QrcodeScanner(
      'qr-scanner-container',
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
        supportedScanTypes: [],
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        handleQrCode(decodedText);
      },
      (errorMessage: string) => {
        console.log("ignore: ", errorMessage);
      }
    );
  }, [stopCameraScanner, handleQrCode]);

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }

    return () => {
      stopCameraScanner();
    };
  }, [isOpen, activeTab, startCameraScanner, stopCameraScanner]);

  const scanQrFromImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // Создаем временный экземпляр Html5Qrcode для сканирования из файла
          const html5QrCode = new Html5Qrcode("temp-qr-reader");
          
          const decodedText = await html5QrCode.scanFile(file, true);
          resolve(decodedText);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      // Для файлов мы будем использовать Html5Qrcode для сканирования QR из изображения
      const text = await scanQrFromImage(file);
      if (text) {
        await handleQrCode(text);
      } else {
        setError('Не удалось найти QR-код на изображении');
      }
    } catch (err) {
      setError('Ошибка при чтении QR-кода из изображения');
      console.error('Error reading QR file:', err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="qr-scanner-modal-overlay" onClick={handleOverlayClick}>
      <div className="qr-scanner-modal-content">
        <div className="qr-scanner-header">
          <h2>Сканирование QR-кода</h2>
          <button className="qr-scanner-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="qr-scanner-body">
          {error && (
            <div className="qr-scanner-error">
              {error}
            </div>
          )}

          <div className="qr-scanner-tabs">
            <button 
              className={`tab-button ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => setActiveTab('camera')}
            >
              Камера
            </button>
            <button 
              className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Загрузить фото
            </button>
          </div>

          <div className="qr-scanner-content">
            {activeTab === 'camera' && (
              <div className="camera-scanner">
                <div 
                  id="qr-scanner-container"
                  ref={scannerContainerRef}
                  style={{ width: '100%', minHeight: '300px' }}
                ></div>
                <div className="camera-overlay">
                  <div className="scan-frame"></div>
                  <p>Наведите камеру на QR-код</p>
                </div>
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="upload-scanner">
                <div className="upload-area" onClick={triggerFileInput}>
                  <div className="upload-icon">📁</div>
                  <h3>Загрузите изображение с QR-кодом</h3>
                  <p>Нажмите для выбора файла</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="upload-formats">
                  <p>Поддерживаемые форматы: JPG, PNG, GIF, BMP</p>
                </div>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="qr-processing">
              <div className="spinner"></div>
              <p>Проверка QR-кода...</p>
            </div>
          )}

          <div className="qr-scanner-info">
            <p>
              <strong>Важно:</strong> QR-код должен быть создан не более 6 часов назад.
              После сканирования вы будете перенаправлены на страницу объекта.
            </p>
          </div>

          {/* Скрытый контейнер для сканирования из файла */}
          <div id="temp-qr-reader" style={{ display: 'none' }}></div>
        </div>
      </div>
    </div>
  );
};

export default QrScannerModal;
