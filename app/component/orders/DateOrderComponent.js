import moment from 'moment';
import 'moment/locale/ar';
import 'moment/locale/en-gb';
import { parse, format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
export const convertDate = (date, language) => {
    // console.log('The input date:', convertArabicDateToNumeric(date));
    
    let parsedDate;

    // Try parsing with both locales
    const arDate = moment(date, 'DD MMMM YYYY', 'ar', true);
    const enDate = moment(date, 'DD MMMM YYYY', 'en', true);

    if (arDate.isValid()) {
        parsedDate = arDate;
    } else if (enDate.isValid()) {
        parsedDate = enDate;
        console.log('thee englis date is ',enDate)
    } else {
        console.log('Invalid date');
        return 'Invalid date';
    }

    // Set the locale for output
    moment.locale(language === 'ar' ? 'ar' : 'en');

    // Format the date in the target language
    const formattedDate = parsedDate.format('DD MMMM YYYY');
    return   language === 'ar' ? formattedDate : convertArabicDateToNumeric(date);
};


// Arabic month names
const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const convertArabicDateToNumeric = (arabicDate) => {
  if (!arabicDate || typeof arabicDate !== 'string') {
    console.log('Invalid input: arabicDate is not a valid string');
    return 'Invalid date';
  }

  // Split the date string
  const parts = arabicDate.split(' ');
  
  if (parts.length !== 3) {
    console.log('Invalid date format');
    return 'Invalid date';
  }

  const [day, monthName, year] = parts;

  // Find the month number (1-indexed)
  const month = arabicMonths.indexOf(monthName) + 1;

  if (month === 0) {
    console.log('Invalid month name');
    return 'Invalid date';
  }

  // Construct a date string that date-fns can parse
  const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;

  // Parse the date
  const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());

  if (isNaN(parsedDate)) {
    console.log('Parsed date is invalid');
    return 'Invalid date';
  }

  // Format the date to the desired output
  return format(parsedDate, 'dd MMMM yyyy', { locale: enUS });
};

