module.exports = {
    formatDate: function (date) {
        return new Intl.DateTimeFormat("ko-KR").format(date);
    },
};
