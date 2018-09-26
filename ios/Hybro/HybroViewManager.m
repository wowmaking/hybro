#import <Cordova/CDVViewController.h>
#import <React/RCTViewManager.h>
#import <React/RCTView.h>

#import "Hybro.h"
#import "HybroViewManager.h"
#import "HybroCordovaPlugin.h"

@implementation HybroViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  CDVViewController* vc = [CDVViewController new];
  [[Hybro getRootViewController] addChildViewController:vc];
  
  // hack to fix incorrect window.innerWidth
  vc.view.frame = CGRectMake(0, 0, 0, 0);
  RCTView *v = [[RCTView alloc] init];
  [v addSubview:vc.view];
  
  return v;
}

@end


