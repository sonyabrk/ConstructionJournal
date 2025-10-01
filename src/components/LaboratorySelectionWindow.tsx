import React, { useState } from 'react';

const LaboratorySelectionWindow: React.FC = () => {
    const [material, setMaterial] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Логика отправки формы
        console.log('Материал:', material);
    };

    return (
        <div>
            <h1>Инициирование лабораторного отбора</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <h2>Материал</h2>
                    <input
                        type="text"
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Введите материал"
                    />
                </div>

                <hr />

                <button type="submit">
                    Инициировать
                </button>
            </form>
        </div>
    );
};

export default LaboratorySelectionWindow;