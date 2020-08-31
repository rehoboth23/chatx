var month = [
    "Jan", "Feb",
    "Mar", "Apr",
    "May", "Jun",
    "Jul", "Aug",
    "Sep", "Oct",
    "Nov", "Dec"
]
const date_handler = (date) => {
    const date_diff = new Date().getDate() - date.getDate()
    const month_diff = new Date().getUTCMonth() - date.getUTCMonth()
    const {hours, meridian} = twelveHourClock(date.getHours())

   if(date_diff === 1 && month_diff === 0){
        return`Yesterday ${hours}:${date.getMinutes()}${meridian}`
    } else if(date_diff === 0 && month_diff === 0) {
        return`${hours}:${date.getMinutes()}${meridian}`
    } else {
       return`${month[date.getUTCMonth()]} ${datePrefix(date.getDate())} ${date.getFullYear()}`
    }
}

String.prototype.lpad = function(padString, length) {
    let string = this.toString()
    while (string.length < length)
        string = padString + string;
    return string;
}

const twelveHourClock = (hours) => {
    if(hours < 12) {
        const hour = (hours).toString().lpad("0", 2)
        return {hours: hour, meridian: 'am'}
    } else {
        const hour = (hours - 12).toString().lpad("0", 2)
        return {hours: hour, meridian: 'pm'}
    }
}

const datePrefix = (day) => {
    if(day in [1, 21, 31]) {
        return `${day}st`
    }else if(day in [12, 22]) {
        return `${day}nd`
    }else if(day in [3, 23]) {
        return `${day}rd`
    }else {
        return `${day}th`
    }
}

module.exports = date_handler