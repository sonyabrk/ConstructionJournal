import profileSvg from "../assets/profile.svg"

function Header() {
    return (
        <>
            <div className="header">
                <a href="/" className="headerProfile">
                    <img src={profileSvg} alt="Профиль"/>
                </a>
                <p>Электронный журнал</p>
            </div>
        </>
    )
}

export default Header;