import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;

public class Admin extends User {


    public Admin(int userId) {
        super(userId, "admin", "123", Role.ADMIN, 0.0);
    }


    public String answerQuestion(String question) {
        String answer = "پاسخ ادمین به سوال شما: درخواست شما بررسی و تایید شد.";

        try (FileWriter fw = new FileWriter("new_questions.txt", true);
             PrintWriter pw = new PrintWriter(fw)) {

            pw.println("Question: " + question);
            pw.println("Answer: " + answer);
            pw.println("-----------------------------------");

            System.out.println("سوال و پاسخ با موفقیت در فایل new_questions.txt ذخیره شد.");

        } catch (IOException e) {
            System.out.println("خطا در نوشتن فایل سوالات: " + e.getMessage());
        }

        return answer;
    }


    public void viewAllQuestions() {
        System.out.println("--- نمایش تمام سوالات ثبت شده در سیستم (از فایل قابل بازخوانی است) ---");
    }
}