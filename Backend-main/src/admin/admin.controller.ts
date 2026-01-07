// @ts-ignore
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ContactService } from 'src/contact/contact.service';
import {
  MemorialDecoration,
  MemorialDonationWreath,
  MemorialTribute,
} from 'src/memorial/interface/memorial.interface';
import { MemorialService } from 'src/memorial/memorial.service';
import { OrderStatus } from 'src/shop/interface/shop.interface';
import { ShopService } from 'src/shop/shop.service';
import { UserAccountStatus } from 'src/user/interface/user.interface';
import { UserService } from 'src/user/user.service';
// @ts-ignore
import { Session, VerifySession } from 'supertokens-nestjs';
// @ts-ignore
import { SessionContainer } from 'supertokens-node/recipe/session';
import { MemoryService } from 'src/memorial/memory/memory.service';
import { CondolenceService } from 'src/memorial/condolence/condolence.service';
import { DonationService } from 'src/memorial/donation/donation.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly memorialService: MemorialService,
    private readonly contactService: ContactService,
    private readonly shopService: ShopService,
    private readonly memoryService: MemoryService,
    private readonly condolenceService: CondolenceService,
    private readonly donationService: DonationService,
  ) {}

  // #region User
  @VerifySession({
    roles: ['admin'],
  })
  @Get('users')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getAdminUserDetails(id);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Get('users/:id/customer')
  async getCustomerId(@Param('id') id: string) {
    const customer = await this.shopService.findCustomerByUserId(id);
    return customer?.id ?? null;
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Patch('users/:id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() { status }: { status: UserAccountStatus },
    @Session() session: SessionContainer,
  ) {
    return this.userService.updateUserStatus(id, status, session.getUserId());
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Get('users/memorials/:userId')
  async getUserMemorials(@Param('userId') userId: string) {
    return this.memorialService.getOwnedMemorialPreviews(userId);
  }

  // #endregion User

  // #region Memorials
  @VerifySession({
    roles: ['admin'],
  })
  @Get('memorials')
  async getAllMemorials() {
    return this.memorialService.getAdminMemorials();
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Get('memorials/:id')
  async getAdminMemorialById(@Param('id') id: string) {
    return this.memorialService.getAdminMemorialById(id);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Post('memorials/featured/:id')
  async addFeaturedMemorial(@Param('id') id: string, @Session() session: SessionContainer) {
    return this.memorialService.addFeaturedMemorial(session.getUserId(), id);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Delete('memorials/featured/:id')
  async removeFeaturedMemorial(@Param('id') id: string, @Session() session: SessionContainer) {
    return this.memorialService.removeFeaturedMemorial(session.getUserId(), id);
  }
  // #endregion Memorials

  // #region Contact Forms
  @VerifySession({
    roles: ['admin'],
  })
  @Get('contact-forms')
  async getOpenContactForms() {
    return this.contactService.getOpenContactForms();
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Get('contact-forms/:id')
  async getContactFormById(@Param('id') id: string) {
    return this.contactService.getContactFormById(id);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Patch('contact-forms/close/:id')
  async closeContactForm(@Param('id') id: string, @Session() session: SessionContainer) {
    return this.contactService.closeContactForm(session.getUserId(), id);
  }
  // #endregion Contact Forms

  // #region Shop
  @VerifySession({
    roles: ['admin'],
  })
  @Get('shop/orders')
  async getAllOrders() {
    return this.shopService.getAllOrders();
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Get('shop/orders/:id')
  async getOrderById(@Param('id') id: string) {
    return this.shopService.getOrderByIdAdmin(id);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Patch('shop/orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() { status }: { status: OrderStatus },
    @Session() session: SessionContainer,
  ) {
    return this.shopService.updateOrderStatus(id, status, session.getUserId());
  }
  // #endregion Shop

  // #region Memorial Flags
  @VerifySession({
    roles: ['admin'],
  })
  @Get('memorial-flags')
  async getOpenMemorialFlags() {
    return this.memorialService.getOpenAdminFlags();
  }
  // #endregion Memorial Flags

  // #region Contributions
  @VerifySession({
    roles: ['admin'],
  })
  @Get('memory/:id')
  async getMemoryById(@Param('id') id: string) {
    return this.memoryService.getMemoryById(id);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Get('condolence/:id')
  async getCondolenceById(@Param('id') id: string) {
    return this.condolenceService.getCondolenceById(id);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Get('donation/:id')
  async getDonationById(@Param('id') id: string) {
    return this.donationService.getDonationById(id);
  }
  // #endregion Contributions

  // #region Shop Prices
  @VerifySession({
    roles: ['admin'],
  })
  @Patch('price/decoration/:decoration')
  async updateDecorationPrice(
    @Param('decoration') decoration: MemorialDecoration,
    @Body() { priceInCents }: { priceInCents: number },
  ) {
    return this.shopService.updateDecorationPrice(decoration, priceInCents);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Patch('price/tribute/:tribute')
  async updateTributePrice(
    @Param('tribute') tribute: MemorialTribute,
    @Body() { priceInCents }: { priceInCents: number },
  ) {
    return this.shopService.updateTributePrice(tribute, priceInCents);
  }

  @VerifySession({
    roles: ['admin'],
  })
  @Patch('price/wreath/:wreath')
  async updateWreathPrice(
    @Param('wreath') wreath: MemorialDonationWreath,
    @Body() { priceInCents }: { priceInCents: number },
  ) {
    return this.shopService.updateWreathPrice(wreath, priceInCents);
  }
  // #endregion Shop Prices
}
