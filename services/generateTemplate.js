//contain detail about send mail
function generateTemplate(mail) {
  return {
    resetPassword: `<table cellpadding='0' cellspacing='0'>
          <tr>
              <td>
                  <h1 align="right">איפוס סיסמה</h1>
                  <h2 align="right" cellpadding='0'>לחץ על הלינק על מנת לאפס את הסיסמה</h2>
              </td>
          </tr>
          <tr ><td><p>http://localhost:3000/reset-password/${mail.userId}/${mail.token}</p></td></tr>
          <tr ><td align="right"><p>לשאלות נוספות ניתן לפנות לכתובת המייל</p></td></tr>
          <tr ><td align="right">projectdog30@outlook.co.il</td></tr>
      </table>`,
    authenticateUser: "",
    contactUs: `<table cellpadding='0' cellspacing='0'>
    <tr>
        <td>
            <h1 align="right">הודעה מצור קשר </h1>
        </td>
    </tr>
    <tr><td>הודעה התקבלה מ ${mail.fullName}</td></tr>
    <tr><td>אימייל השולח הינו: ${mail.email}</td></tr>
    <tr><td><div>תוכן הפניה הינו : <br><br> </div></td></tr>
    <tr><td><div> ${mail.content} </div></td></tr>
   
</table>`,
    sendImage: "",
    receiveComments: "",
  };
}

module.exports = { generateTemplate };
