const fetchFilterData = () => new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            "filial": [
              {
                "name": "Для частных лиц",
                "code": "LINK_FL"
              },
              {
                "name": "Для юридических лиц",
                "code": "LINK_CRP"
              },
              {
                "name": "Для маломобильных граждан",
                "code": "MOBILE_GROUP"
              },
              {
                "name": "Для клиентов Premium",
                "code": "PREMIUM"
              },
              {
                "name": "Открыто сейчас",
                "code": "OPEN"
              },
              {
                "name": "Без выходных",
                "code": "EVERYDAY"
              }
            ],
            "atm": [
              {
                "name": "Пополнить",
                "code": "RECEIVING_CASH"
              },
              {
                "name": "Круглосуточно",
                "code": "OFFICE_ATM"
              },
              {
                "name": "Банкоматы банков-партнеров",
                "code": "PARTNERS"
              },
              {
                "name": "Открыто сейчас",
                "code": "OPEN"
              }
            ],
            "region": [],
            "terminal": [
              {
                "name": "Открыто сейчас",
                "code": "OFFICE_TERMINAL"
              },
              {
                "name": "Круглосуточно",
                "code": "OFFICE_TERMINAL"
              }
            ]
          });
    }, 500);
});

export {
    fetchFilterData
};