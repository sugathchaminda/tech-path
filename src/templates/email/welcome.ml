<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text align="center" font-size="24px" font-family="Arial Helvetica" font-weight="600">Verify your email address</mj-text>
        <mj-text align="center" font-size="18px" font-family="Arial Helvetica" line-height="1.5" padding-bottom="5px">To start using your account, <br/>
you need to confirm your email address</mj-text>
        <mj-text align="center" font-size="18px" font-family="Arial Helvetica" font-weight="600" padding="0">
  <a rel="nofollow" color="#000" text-decoration="none">{{email}}</a>
</mj-text>
        <mj-text align="center" font-size="18px" font-family="Arial Helvetica" padding="25px">The link will be active for {{ expireTime }}</mj-text>
        <mj-button background-color="#3C55FF" border-radius="100px" font-size="18px" font-weight="600"
 href="{{verifyLink}}">Verify email address</mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>