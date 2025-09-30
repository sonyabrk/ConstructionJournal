import profileSvg from "../assets/profile.svg"

function Header() {
    return (
        <>
            <div className="header">
                <a href="/" className="headerProfile">
                    <img className="headerProfileImg" src={profileSvg} alt="Профиль"/>
                </a>
                <p className="headerJournal">Электронный журнал</p>
            </div>
        </>
    )
}

export default Header;