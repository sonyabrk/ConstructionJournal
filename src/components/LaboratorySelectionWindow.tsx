import React, { useState } from 'react';

const LaboratorySelectionWindow: React.FC = () => {
    const [material, setMaterial] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Логика отправки формы
        console.log('Материал:', material);
    };

    return (
        <div className="laboratory-selection">
            <h1 className="laboratory-selection__title">Инициирование лабораторного отбора</h1>

            <form onSubmit={handleSubmit} className="laboratory-selection__form">
                <div className="laboratory-selection__section">
                    <h2 className="laboratory-selection__section-title">Материал</h2>
                    <input
                        type="text"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Введите материал"
                        className="laboratory-selection__input"
                    />
                </div>

                <hr className="laboratory-selection__separator" />

                <button type="submit" className="laboratory-selection__submit-button">
                    Инициировать
                </button>
            </form>
        </div>
    );
};

export default LaboratorySelectionWindow;