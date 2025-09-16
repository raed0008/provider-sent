import { useLanguageContext } from '../context/LanguageContext';

const useNameInLanguage = () => {
    const { language } = useLanguageContext();
    return {
        name :`name_${language}`,
        location :`location_${language}`,

    };
};

export default useNameInLanguage;
