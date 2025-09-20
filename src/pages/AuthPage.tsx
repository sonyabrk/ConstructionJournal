function AuthPage() {
    return (
        <>
            <div className='authorization'>
                <p>Вход</p>
                <label>Логин:</label>
                <input id="email" type="email" placeholder="Введите email"/>
                <label>Пароль:</label>
                <input id="password" type="password" placeholder="Введите пароль"/>
                <button type="submit">Войти</button>
            </div>
        </>
    );
}

export default AuthPage;