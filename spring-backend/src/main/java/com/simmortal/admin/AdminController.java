package com.simmortal.admin;

import com.simmortal.memorial.MemorialDecoration;
import com.simmortal.memorial.MemorialDonationWreath;
import com.simmortal.memorial.MemorialTribute;
import com.simmortal.shop.OrderStatus;
import com.simmortal.user.UserAccountStatus;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminController {
}
