import { createLogic }      from 'redux-logic';
import axios                from 'axios';
import validator            from 'validator';

import {    resetRegistrationFormFields,
            errorRegistrationFormField,
            registrationFormError,
            submitEmailFormSuccess,
            submitEmailFormError,
            resetFormSteps,
            changeFormStep,
            formSuccess,
            formError,
            formSubmit }    from '../actions/registrationActions';

const emailRegistration = createLogic({
    type: 'SUBMIT_EMAIL_REGISTRATION',
    async process({ getState, action, APIEndpoint }, dispatch, done){
        try {
            if(validator.isEmail(getState().register.contactEmailName)){
                await axios.post(APIEndpoint + '/api/email-registration',{ email: getState().register.contactEmailName });
                action.history.push('/email-signup');
                dispatch(submitEmailFormSuccess())
            }else{
                dispatch(submitEmailFormError("not a valid email"))
            }
        } catch (err) {
            dispatch(submitEmailFormError(err))
        } finally {
            done();
        }
    }
})

const userRegister = createLogic({
    type: 'SUBMIT_REGISTRATION_FIELDS',
    async process({ getState, action, APIEndpoint }, dispatch, done) {
        try {
            dispatch(resetRegistrationFormFields());
            var sale = getState().sale;
            var reg = getState().register;
            const errors = validate(reg, sale);

            if(errors.length === 0){
                try{
                    dispatch(formSubmit());
                    await axios.post(APIEndpoint + '/api/register',{
                        access_id: sale.accessId,
                        api_token: sale.apiToken,
                        name: reg.contactFirstName +" "+ reg.contactLastName,
                        email: reg.contactEmail,
                        address: reg.contactAddress,
                        country: reg.contactCountry,
                        amount: reg.purchaseSize,
                        check: reg.countryCheck
                        //user_response: sale.recaptchaUserResponse
                    })
                    dispatch(resetFormSteps());
                    dispatch(formSuccess());
                    dispatch(changeFormStep('step4'));
                    done();
                } catch (err){
                    console.log('http request error');
                    dispatch(resetFormSteps());
                    dispatch(formError());
                    dispatch(changeFormStep('stepError'));
                    done()
                }
            }else {
                errors.forEach(error => { dispatch(error) });
                dispatch(formError());
                done()
            }
        } catch (err) {
            dispatch(registrationFormError(err));
            dispatch(formError());
            dispatch(resetFormSteps());
            dispatch(changeFormStep('stepError'));
            done();
        } finally {
            dispatch(formError());
            done()
        }
    }
});

const userStep1 = createLogic({
    type: 'VALIDATE_FORM_FIELDS_STEP1',
    async process({ getState, action, APIEndpoint }, dispatch, done) {
        try {
            dispatch(resetRegistrationFormFields());
            var sale = getState().sale;
            var reg = getState().register;

            const errors = validateStep1(reg, sale);

            if(errors.length === 0){
                var result = await axios.post(APIEndpoint + '/api/validate_email',{
                    access_id: sale.accessId,
                    api_token: sale.apiToken,
                    email: reg.contactEmail,
                })
               
                //console.log('result: ' + JSON.stringify(result));
                //console.log('type of result: ' + (typeof result));
                if(result.data){
                    dispatch(resetFormSteps())
                    dispatch(changeFormStep('step2'))
                }
                else{
                    dispatch(errorRegistrationFormField('duplicateEmail'))
                }
                done();
            }else {
                errors.forEach(error => { dispatch(error) })
                done();
            }
        } catch (err) {
            dispatch(registrationFormError(err));
        } finally {
            done()
        }
    }
});

const userStep2 = createLogic({
    type: 'VALIDATE_ADDRESS_FIELD',
    async process({ getState, action, APIEndpoint }, dispatch, done) {
        try {
            dispatch(resetRegistrationFormFields());
            var sale = getState().sale;
            var reg = getState().register;

            const errors = validateStep2(reg, sale);
            if(errors.length === 0){
                var result = await axios.post(APIEndpoint + '/api/validate_eth_address',{
                    access_id: sale.accessId,
                    api_token: sale.apiToken,
                    eth_address: reg.contactAddress,
                })
                if(result.data){
                    dispatch(resetFormSteps())
                    dispatch(changeFormStep('step3'))
                }else{
                    dispatch(errorRegistrationFormField('duplicateAddress'))
                }
                done();
            }else {
                errors.forEach(error => { dispatch(error) })
                done();
            }
        } catch (err) {
            dispatch(registrationFormError(err));
        } finally {
            done()
        }
    }
})

function validate (reg, sale) {
    const errors = []; 
    //if(!sale.captchaPassed)
    //    errors.push(errorRegistrationFormField('Recaptcha')); 
    if(!validator.isAlphanumeric(reg.contactFirstName.replace(/ /g,'')))
        errors.push(errorRegistrationFormField('contactFirstNameCheck'));
    if(!validator.isAlphanumeric(reg.contactLastName.replace(/ /g,'')))
        errors.push(errorRegistrationFormField('contactLastNameCheck'));
    if(!validator.isEmail(reg.contactEmail))
        errors.push(errorRegistrationFormField('contactEmailCheck'));
    if(!validator.isAlphanumeric(reg.contactCountry.replace(/ /g,'')))
        errors.push(errorRegistrationFormField('contactCountryCheck'));
    if(!(validator.isAlphanumeric(reg.contactAddress) && reg.contactAddress.length === 42))
        errors.push(errorRegistrationFormField('contactAddressCheck'));
    if(!(validator.isDecimal(reg.purchaseSize) && reg.purchaseSize >= 1 && reg.purchaseSize <= 100))
        errors.push(errorRegistrationFormField('purchaseSizeCheck'));
    if(!reg.countryCheck)
        errors.push(errorRegistrationFormField('countryCheckValidation'));
    if(!reg.termsCheck)
        errors.push(errorRegistrationFormField('termsCheckValidation'));
    return errors;
}

function validateStep1 (reg, sale) {
    const errors = []; 
    if(!validator.isAlphanumeric(reg.contactFirstName.replace(/ /g,'')))
        errors.push(errorRegistrationFormField('contactFirstNameCheck'));
    if(!validator.isAlphanumeric(reg.contactLastName.replace(/ /g,'')))
        errors.push(errorRegistrationFormField('contactLastNameCheck'));
    if(!validator.isEmail(reg.contactEmail))
        errors.push(errorRegistrationFormField('contactEmailCheck'));
    if(!validator.isAlphanumeric(reg.contactCountry.replace(/ /g,'')))
        errors.push(errorRegistrationFormField('contactCountryCheck'));
    if(!reg.countryCheck)
        errors.push(errorRegistrationFormField('countryCheckValidation'));
    if(!reg.termsCheck)
        errors.push(errorRegistrationFormField('termsCheckValidation'));
    return errors;
}

function validateStep2 (reg, sale) {
    const errors = []; 
    if(!(validator.isAlphanumeric(reg.contactAddress) && reg.contactAddress.length === 42))
        errors.push(errorRegistrationFormField('contactAddressCheck'));
    return errors;
}

export default [
    userRegister,
    emailRegistration,
    userStep1,
    userStep2
]
