import React, { useState } from 'react';

interface ViolationFormData {
    title: string;
    startDate: string;
    endDate: string;
    comment: string;
    files: File[];
}

const AddViolationForm: React.FC = () => {
    const [formData, setFormData] = useState<ViolationFormData>({
        title: '',
        startDate: '',
        endDate: '',
        comment: '',
        files: []
    });

    const handleInputChange = (field: keyof ViolationFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, ...newFiles]
            }));
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Обработка отправки формы
        console.log('Данные формы:', formData);
    };

    return (
        <div className="violation-form">
            <h1>Добавление нарушения</h1>

            <form onSubmit={handleSubmit}>
                {/* Название нарушения */}
                <section className="form-section">
                    <h2>Название нарушения</h2>
                    <div className="input-item">
                        <input
                            type="text"
                            placeholder="Введите название нарушения"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            className="text-input"
                        />
                    </div>
                </section>

                {/* Сроки исправления */}
                <section className="form-section">
                    <h2>Сроки исправления</h2>
                    <div className="date-fields">
                        <div className="date-field">
                            <label htmlFor="start-date">
                                <strong>С:</strong>
                            </label>
                            <input
                                id="start-date"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                className="date-input"
                            />
                        </div>
                        <div className="date-field">
                            <label htmlFor="end-date">
                                <strong>по:</strong>
                            </label>
                            <input
                                id="end-date"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                className="date-input"
                            />
                        </div>
                    </div>
                </section>

                {/* Комментарий */}
                <section className="form-section">
                    <h2>Комментарий</h2>
                    <div className="input-item">
                        <textarea
                            placeholder="Введите комментарий"
                            value={formData.comment}
                            onChange={(e) => handleInputChange('comment', e.target.value)}
                            className="text-input textarea"
                            rows={4}
                        />
                    </div>
                </section>

                {/* Фото и документы */}
                <section className="form-section">
                    <h2>Фото и документы</h2>
                    <div className="input-item">
                        <label className="file-upload-label">
                            <input
                                type="file"
                                multiple
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            <span className="file-upload-text">
                                Добавьте фото или документ в формате PDF
                            </span>
                        </label>
                    </div>
                    {formData.files.length > 0 && (
                        <div className="file-list">
                            <p>Добавленные файлы:</p>
                            <ul>
                                {formData.files.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                <hr />

                {/* Кнопка отправки */}
                <div className="submit-section">
                    <button type="submit" className="submit-button">
                        Добавить нарушение
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddViolationForm;