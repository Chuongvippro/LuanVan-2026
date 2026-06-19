import org.mindrot.jbcrypt.BCrypt;
public class HashGenerator {
    public static void main(String[] args) {
        System.out.println("BCRYPT_HASH_RESULT=" + BCrypt.hashpw("123456", BCrypt.gensalt(10)));
    }
}
