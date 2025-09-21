function AuthPage() {
    return (
        <>
            <div className="authorization">
                <p className="authEnter">Вход</p>
                <label className="athLog">Логин:</label>
                <input id="email" type="email" placeholder="Введите email"/>
                <label className="authPas">Пароль:</label>
                <input id="password" type="password" placeholder="Введите пароль"/>
                <button type="submit" className="AuthEnterBtn">Войти</button>
            </div>
        </>
    );
}

export default AuthPage;